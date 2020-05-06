<h1>How to setup Yip for working locally</h1>

1. Get the nightly build for Rust here: https://www.rust-lang.org/tools/install. Do not use the default settings. Instead customize it and ensure that the Nightly build is set.
2. Open the project and go into the frontend folder. Type 'npm i' in there to download project dependencies.
3. Run 'npm run build'

<h1>How to work on Frontend</h1>

1. Navigate to frontend folder
2. Do work
3. Run 'npm run build'
4. That will update main.js for the backend to display
5. Navigate to backend folder
6. Run 'cargo build' and then 'cargo run'. Go to http://localhost:8000/.

<h1>How to work on Backend</h1>

1. Navigate to backend folder
2. Do work
3. Run 'cargo build' to compile
4. Run 'cargo run'. Go to http://localhost:8000/.

<h1>How to view database</h1>

1. Install PostgreSQL here: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Open pgAdmin
3. Navigate to the dashboard and "Add New Server"
4. Enter whatever name
5. Navigate to "Connection"
6. Place this in the host name/address: yip.cdcryg67tbhj.us-east-2.rds.amazonaws.com
7. Username: postgres
8. Password: yipyipdb
9. Hit "Save"
10. On the File Browser to the left, navigate to the newly connected database
11. Go to Databases -> postgres -> Schemas -> Tables
12. Right click on any table and select "View/Edit Data" to view table contents.
