use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Repository {
    pub name: String,
    pub category: String,
}

impl Repository {
    pub fn new(name: String, category: String) -> Result<Repository, &'static str> {
        Ok(Repository { name, category })
    }
}
