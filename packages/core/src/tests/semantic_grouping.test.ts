import { DbService, AuthService, LocalLibSqlAdapter, migrate } from "@loghead/db";
import { connect } from "@tursodatabase/database";
import fs from "fs";
import path from "path";

// Mock OllamaService matching the expected interface
class MockOllamaService {
    async generateEmbedding(text: string): Promise<number[]> {
        console.log(`[MockOllama] Generating embedding for: "${text}"`);
        // Simple deterministic embedding
        const embedding = new Array(1024).fill(0.001); // Fill with small noise
        
        const normalized = text.toLowerCase();
        
        // "Database Error" cluster
        if (normalized.includes("database") || normalized.includes("connection")) {
            embedding[0] = 0.9; 
            embedding[1] = 0.1;
        } 
        // "JS Error" cluster
        else if (normalized.includes("property") || normalized.includes("undefined") || normalized.includes("typeerror")) {
            embedding[0] = 0.1;
            embedding[1] = 0.9;
        }
        
        return embedding;
    }
}

async function runTest() {
    const dbPath = "test_semantic.db";
    // Clean up previous run
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    if (fs.existsSync(dbPath + "-wal")) fs.unlinkSync(dbPath + "-wal");
    if (fs.existsSync(dbPath + "-shm")) fs.unlinkSync(dbPath + "-shm");

    const resolvedPath = path.resolve(dbPath);
    console.log("Setting up test database at:", resolvedPath);

    // Create client using @tursodatabase/database
    const dbClient = await connect(resolvedPath);

    // Initialize services
    const adapter = new LocalLibSqlAdapter(dbClient as any); 
    const auth = new AuthService(adapter);
    const ollama = new MockOllamaService() as any;
    const service = new DbService(adapter, auth, ollama);

    try {
        console.log("Migrating database...");
        await migrate(adapter, false);

        console.log("Creating project...");
        const project = await service.createProject("Test Project");
        
        console.log("Creating stream...");
        const stream = await service.createStream(project.id, "test-stream", "Test Stream");

        console.log("--- Test Case 1: Ingesting First Error (Database Timeout) ---");
        const log1Content = "Error: Database connection timeout at /src/db.ts:50";
        await service.addLog(stream.id, log1Content, { severity: "ERROR" });
        
        // Get the issue created
        let issues = await service.getIssues(project.id);
        console.log(`Issues found: ${issues.length}`);
        if (issues.length !== 1) throw new Error("Expected 1 issue");
        const issue1Id = issues[0].id;
        console.log(`Created Issue 1: ${issue1Id} (${issues[0].title})`);

        console.log("--- Test Case 2: Ingesting Similar Error (DB Connection Failed) ---");
        // This should normalize to something similar and hit the "Database" mock embedding cluster
        const log2Content = "Exception: Connection to database failed in query.js"; 
        await service.addLog(stream.id, log2Content, { severity: "ERROR" });

        issues = await service.getIssues(project.id);
        console.log(`Issues found: ${issues.length}`);
        // Should still be 1 issue if grouping worked
        if (issues.length !== 1) {
            console.log("Issue grouping FAILED. Issues:");
            console.log(JSON.stringify(issues, null, 2));
            throw new Error("Expected 1 issue (grouped), found " + issues.length);
        } else {
            console.log("SUCCESS: Log 2 grouped into Issue 1");
        }
        
        // Check logs for issue 1
        const issueDetails = await service.getIssue(issue1Id);
        if (!issueDetails || issueDetails.logs.length !== 2) {
             throw new Error(`Expected 2 logs in Issue 1, found ${issueDetails?.logs.length}`);
        }

        console.log("--- Test Case 3: Ingesting Different Error (JS Undefined) ---");
        // This hits the "JS Error" mock embedding cluster
        const log3Content = "TypeError: Cannot read property 'map' of undefined";
        await service.addLog(stream.id, log3Content, { severity: "ERROR" });

        issues = await service.getIssues(project.id);
        console.log(`Issues found: ${issues.length}`);
        
        if (issues.length !== 2) {
             console.log("Semantic separation FAILED. Issues:");
             console.log(JSON.stringify(issues, null, 2));
             throw new Error("Expected 2 issues, found " + issues.length);
        } else {
             console.log("SUCCESS: Log 3 created a new Issue");
        }

        console.log("\nAll semantic grouping tests PASSED!");

    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
        if (fs.existsSync(dbPath + "-wal")) fs.unlinkSync(dbPath + "-wal");
        if (fs.existsSync(dbPath + "-shm")) fs.unlinkSync(dbPath + "-shm");
    }
}

runTest();
