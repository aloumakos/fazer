use crate::dbms::models::DatabaseConnection;
use crate::AppState;
use actix_web::{web, HttpResponse};
use diesel::r2d2::{ConnectionManager, Pool};
use diesel::{Connection, PgConnection};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct PythonConnection {
    connection_string: String,
    table_name: String,
}

pub async fn set_database_connection(
    state: web::Data<AppState>,
    mut db_connection: web::Json<DatabaseConnection>,
) -> HttpResponse {
    //load python_url from .env
    let mut python_url = std::env::var("PYTHON_URL").expect("PYTHON_URL must be set");
    python_url.push_str("/dbsync");

    let new_database_url = format!(
        "{}://{}:{}@{}:{}/{}",
        db_connection.db_type, db_connection.username, db_connection.password, db_connection.ip, db_connection.port , db_connection.database
    );

    //python fix db_type
    if db_connection.db_type == "postgres" {
        db_connection.db_type = String::from("postgresql");
    }

    let python_connection = PythonConnection {
        connection_string: format!(
            "{}://{}:{}@{}:{}/{}",
            db_connection.db_type, db_connection.username, db_connection.password, db_connection.ip, db_connection.port , db_connection.database,

        ),
        table_name: db_connection.table_name.clone(),
    };


    let new_connection: Pool<ConnectionManager<PgConnection>> =
        match PgConnection::establish(&new_database_url.as_str()) {
            Ok(_conn) => {
                let manager = ConnectionManager::<PgConnection>::new(new_database_url);
                Pool::builder()
                    .build(manager)
                    .expect("Failed to create pool.")
            }
            Err(e) => {
                return HttpResponse::InternalServerError().json(e.to_string());
            }
        };

    let mut connection = state.pool.lock().unwrap();
    *connection = new_connection;

    println!("Connection verified, calling python");

    let client = reqwest::Client::builder()
        .connect_timeout(std::time::Duration::from_secs(10))
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .unwrap();

    let res = client
        .post(python_url.as_str())
        .body(serde_json::to_string(&python_connection).unwrap())
        .header("Content-Type", "application/json")
        .send().await.is_ok();

    if res {
        println!("Python sync successful");
        HttpResponse::Ok().json("Database connection changed.")
    } else {
        println!("Could not communicate with python");
        HttpResponse::InternalServerError().json("Could not communicate with python")
    }
}

//adding tables on runtime for categories

//adding an extra database connection for categories
