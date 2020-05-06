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

<h1>How to setup Database</h1>

1. Install PostgreSQL here: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Remember the username and password you use when setting it up (default user is usually "postgres")
3. Go to backend/.env and change the URL to have your username and password
4. Go to backend/src/db.rs and change the URL on line 17 to have your username and password
5. If on Windows, go to C:/Program Files/PostgresQL/12 (or whatever version) and run pg_env.bat 
6. Navigate to backend folder in terminal
8. Run 'cargo install diesel_cli --no-default-features --features postgres'
9. If you got any errors with the above step, message Sachinda 
10. Run 'diesel setup'
11. Run 'diesel migration run'
