<h1>How to setup Yip for working locally</h1>

1. Get the nightly build for Rust here: https://www.rust-lang.org/tools/install. Do not use the default settings. Instead customize it and ensure that the Nightly build is set.
2. Open the project and go into the frontend folder. Type 'npm i' in there to download project dependencies.
3. Run 'npm run build'

<h3>Installing Postgresql and diesel</h3>

1. Install PostgreSQL for your OS here: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. IF YOU'RE ON WINDOWS: Run the batch file here C:\Program Files\PostgreSQL\12\pg_env.bat or wherever you installed postgresql
3. IF YOU'RE ON UBUNTU: Run this command 'sudo apt install libpq-dev libmysqlclient-dev'
3. Run 'cargo install diesel_cli --no-default-features --features postgres' in the backend folder
4. Run 'diesel setup' in the backend folder

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

1. Open pgAdmin
2. Navigate to the dashboard and "Add New Server"
3. Enter whatever name
4. Navigate to "Connection"
5. Place this in the host name/address: yip.cdcryg67tbhj.us-east-2.rds.amazonaws.com
6. Username: postgres
7. Password: yipyipdb
8. Hit "Save"
9. On the File Browser to the left, navigate to the newly connected database
10. Go to Databases -> postgres -> Schemas -> Tables
11. Right click on any table and select "View/Edit Data" to view table contents.

<h1>How to use Docker</h1>

<h3>Using VSCode remote container extension</h3>

1. Open the yip folder in vscode
2. A popup should ask if you want to reopen the folder in the conatiner
3. Reopen the folder in the container using the Dockerfile
4. The first time the image will need to be built which may take a while

<h3>Using the command line</h3>

1. The image can be built by running 'docker build -t yip .' from the yip folder

<h4>Running with the command line option #1</h4>

1. The image can be run with 'docker run --network="host" -it yip /bin/bash'
2. Run 'cargo build' and then 'cargo run'. Go to http://localhost:8000/. 

<h4>Running with the command line option #2</h4>

1. The image can be run with 'docker run -p 8000:8000 -it yip /bin/bash'
2. Run 'cargo build' and then 'ROCKET_ENV=stage cargo run'. Go to http://0.0.0.0:8000.