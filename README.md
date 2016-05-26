# laputa-schema

### Setup:
1. git clone https://github.com/TopPano/laputa-schema.git
2. cd laputa-migrator
3. npm install
4. vim config.json


### Migrate mongoDB
* node mongoMigration.js


### Delete incomplete record in mongoDB
* node usersDeletion.js
* node mongoDeletion.js

### Migrate S3 bucket
* install aws_cli : http://docs.aws.amazon.com/cli/latest/userguide/installing.html#install-bundle-other-os
* node S3_migration.js


### Validate Schema
* node schema_validator.js
