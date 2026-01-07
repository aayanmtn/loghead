const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(p => fs.statSync(path.join(packagesDir, p)).isDirectory());

console.log("Deploying all packages to npm...");

for (const pkg of packages) {
    if (pkg === 'browser') continue;
    console.log(`\n>>> Deploying ${pkg}...`);
    const pkgDir = path.join(packagesDir, pkg);
    try {
        // Explicitly publish to npm registry with --access public for scoped packages
        execSync('npm publish --registry https://registry.npmjs.org --access public', { cwd: pkgDir, stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to deploy ${pkg} (might be already published)`);
        // Don't exit, try next package
    }
}
console.log("\nDeployment process complete.");
