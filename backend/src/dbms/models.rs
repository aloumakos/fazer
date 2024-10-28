use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DatabaseConnection {
    pub(crate) db_type: String,
    pub(crate) username: String,
    pub(crate) password: String,
    pub(crate) ip: String,
    pub(crate) port: i32,
    pub(crate) database: String,
    pub(crate) table_name: String,
}
