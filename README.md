<h1>More About Yip</h1>
Finding relevant information in common review sites such as Yelp or Amazon Reviewsis very difficult when what’s “relevant” varies between person to person. One personmay value wheelchair accessibility in a given location while another may valueemployee treatment. ​Yip​ allows for such niche information to be readily available to allusers in the form of review communities, or as we call them kennels. Each kennel actsas a beacon to attract all other like-minded individuals who share the same interest toshare their experiences and thoughts with a location, product, service, etc. in the form ofreviews. Any user can join a pre-existing kennel or make their own to start their owncommunity if one does not exist or if a pre-existing one does not live up to theirexpectations. Through this community-building ​Yip​ has or will have a kennel foreveryone.

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
