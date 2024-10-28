use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct License {
    pub name: String,
}

impl License {
    pub fn new(name: String) -> Result<License, &'static str> {
        Ok(License { name })
    }
}
