const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(p => fs.statSync(path.join(packagesDir, p)).isDirectory());

console.log("Deploying all packages to npm...");

let deployed = 0;

for (const pkg of packages) {
    if (pkg === 'browser') continue;
    console.log(`\n>>> Deploying ${pkg}...`);
    const pkgDir = path.join(packagesDir, pkg);
    try {
        execSync('npm publish --registry https://registry.npmjs.org --access public', { cwd: pkgDir, stdio: 'inherit' });
        deployed++;
        console.log(`✓ Successfully published ${pkg}`);
    } catch (e) {
        console.error(`✗ Failed to publish ${pkg}`);
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
}

console.log(`\n✅ Deployment complete: ${deployed} packages published successfully.`);
