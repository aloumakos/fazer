use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum FieldCategory {
    Text,
    Char,
    Bytea,
    Int,
    BigInt,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Field {
    pub id: String,
    pub name: String,
    pub size: String,
    pub category: FieldCategory,
    pub display_name: String,
    pub default_value: String,
    pub description: String,
    pub created_at: String,
    pub updated_at: String,
    pub nullable: bool, // frontend checkbox
    pub required: bool, // frontend checkbox
    pub unique: bool, // frontend checkbox
    pub index: bool, // frontend checkbox
}

impl Field {
    pub fn new(
        id: String,
        name: String,
        size: String,
        category: FieldCategory,
        display_name: String,
        default_value: String,
        description: String,
        created_at: String,
        updated_at: String,
        nullable: bool,
        required: bool,
        unique: bool,
        index: bool,
    ) -> Result<Field, &'static str> {
        // TODO add checks

        Ok(Field {
            id,
            name,
            size,
            category,
            display_name,
            default_value,
            description,
            created_at,
            updated_at,
            nullable,
            required,
            unique,
            index,
        })
    }
}
