# laputa-migrator

### Setup:
1. git clone https://github.com/TopPano/laputa-migrator.git
2. cd laputa-migrator
3. npm install
4. vim config.json


### Migrate mongoDB
* node mongoMigration.js


### Delete incomplete record in mongoDB
* node usersDeletion.js
* node mongoDeletion.js

### Migrate S3 bucket
* node S3_migration.js


### Validate Schema
* node schema_validator.js
