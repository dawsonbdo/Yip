<h1>Look at README.pdf first!</h1>

<h1>How to setup Yip for working locally on Mac OS / Ubuntu</h1>

1. Get the nightly build for Rust here: https://www.rust-lang.org/tools/install. Do not use the default settings. Instead customize it and ensure that the Nightly build is set.
2. Open the project and go into the frontend folder. Type 'npm i' in there to download project dependencies.
3. Run 'npm run build'

<h3>Installing Postgresql and diesel</h3>

1. Install PostgreSQL for your OS here: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. IF YOU'RE ON UBUNTU: Run this command 'sudo apt install libpq-dev libmysqlclient-dev'
3. Run 'cargo install diesel_cli --no-default-features --features postgres' in the backend folder
4. Run 'diesel setup' in the backend folder

<h3>Building the Project </h3>

1. Navigate to frontend folder
3. Run 'npm run build
5. Navigate to backend folder
6. Run 'cargo build' and then 'cargo run'. Go to http://localhost:8000/.