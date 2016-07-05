# ledeTwo
A sweet tool to make cool web things ~~ motto pending

##Process
### High level
1. A Lede instance is created with the compilers and deployer it will be using.
2. Lede is given a project configuration file
3. Lede uses that project config to resolve all dependencies and generates a project report
4. Lede uses the project report to build a cache
5. Lede uses the compilers on the cache to build the project assets
6. Lede deploys the assets using the deployer.

### Dependency Resolution
1. A project config specifies `name` (mostly useful for debugging at this point), `inheritanceRoot` (root directory to search for dependencies from), `dependsOn` (list of dependencies), and a `contentResolver` (object that tells how content should be fetched) for the project.
2. Dependencies are resolved and those dependencies' dependencies are resolved recursively. Each dependency is given a `dependedOnBy` property listing which dependencies rely on it when it is resolved.
3. Dependencies' content is resolved according to the `contentResolver` and merged into a base `content` object.
4. Dependencies' base contexts are resolved and merged into a `context` object.
5. Once resolved, a project report is generated.

### Cache building
1. Create a cachedir
2. Build incremental cache folders for each dependency and post a cache settings with `dependsOn`, `dependedOnBy`. Each dependency copies  in child deps' cache first
3. `updateCache` will rebuild cache by name and then rebuild all that depend on that cache