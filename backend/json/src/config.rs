use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub name: String,
    pub single_face: bool,
    pub store_images_in_database: bool,
}

impl Config {
    pub fn new(
        name: String,
        single_face: bool,
        store_images_in_database: bool,
    ) -> Result<Config, &'static str> {
        Ok(Config {
            name,
            single_face,
            store_images_in_database,
        })
    }
}
