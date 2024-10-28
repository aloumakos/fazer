use crate::field::Field;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Entity {
    pub id: String,
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub created_at: String,
    pub updated_at: String,
    pub index: bool,
    pub fields: Vec<Field>, // individual fields/column queries
}

impl Entity {
    pub fn new(
        id: String,
        name: String,
        display_name: String,
        description: String,
        created_at: String,
        updated_at: String,
        index: bool,
        fields: Vec<Field>,
    ) -> Result<Entity, &'static str> {
        // TODO add checks

        Ok(Entity {
            id,
            name,
            display_name,
            description,
            fields,
            created_at,
            updated_at,
            index,
        })
    }
}
