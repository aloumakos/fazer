use crate::config::Config;
use crate::entity::Entity;
use crate::license::License;

use crate::repository::Repository;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Template {
    pub name: String,// from frontend
    pub version: f32,// auto generated stub
    pub license: License,
    pub config: Config,
    pub entities: Vec<Entity>,// generated from front
    pub watch_lists: String,
    pub repository: Repository,
}

impl Template {
    pub fn new(
        name: String,
        version: f32,
        license: License,
        config: Config,
        entities: Vec<Entity>,// tables queries
        watch_lists: String,
        repository: Repository,
    ) -> Result<Template, &'static str> {
        if version < 1.0 {
            return Err("Version cannot be less than 1.0");
        }

        Ok(Template {
            name,
            version,
            license,
            config,
            entities,
            watch_lists,
            repository,
        })
    }

    pub fn serialize(template: Template) -> String {
        return serde_json::to_string_pretty(&template).unwrap();
    }

    pub fn deserialize(value: String) -> Template {
        return serde_json::from_str(&value).unwrap();
    }
}

//deconstructor
