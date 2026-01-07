const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(p => fs.statSync(path.join(packagesDir, p)).isDirectory());

console.log("Deploying all packages to npm...");

let successfulPackages = [];

for (const pkg of packages) {
    if (pkg === 'browser') continue;
    console.log(`\n>>> Deploying ${pkg}...`);
    const pkgDir = path.join(packagesDir, pkg);
    try {
        // Explicitly publish to npm registry with --access public for scoped packages
        execSync('npm publish --registry https://registry.npmjs.org --access public', { cwd: pkgDir, stdio: 'inherit' });
        successfulPackages.push(pkg);
        console.log(`✓ Successfully deployed ${pkg}`);
    } catch (e) {
        console.error(`\n❌ FATAL: Failed to deploy ${pkg}`);
        console.error(`Error: ${e.message}\n`);
        console.error("Deployment failed. Exiting...\n");
        process.exit(1);
    }
}

console.log("\n========== Deployment Summary ==========");
console.log(`✓ Successfully deployed ${successfulPackages.length} packages:`);
successfulPackages.forEach(pkg => console.log(`  ✓ ${pkg}`));
console.log("========================================\n");
console.log("🎉 All packages deployed successfully!");
