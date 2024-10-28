//Json sample code, possible needs own folder and model in db
// TODO: talk in next meeting about this

use json::config::Config;
use json::entity::Entity;
use json::field::Field;
use json::field::FieldCategory;
use json::license::License;
use json::repository::Repository;
use json::lib::Template;

#[allow(dead_code)]
fn json_test() {
    let mut fields: Vec<Field> = Vec::new();
    let mut i: u8 = 0;
    fields = loop {
        if i > 2 { break fields; }


        let field = Field::new(
            i.to_string(),
            format!("_field{}", i).to_string(),
            "40".to_string(),
            FieldCategory::Int,
            format!("Field {}", i).to_string(),
            "empty".to_string(),
            "First name field for input".to_string(),
            "".to_string(),
            "".to_string(),
            true,
            true,
            true,
            true,
        ).unwrap();

        fields.push(field);
        i = i + 1;
    };


    let mut entities: Vec<Entity> = Vec::new();
    i = 0;
    entities = loop {
        if i > 2 { break entities; }

        let entity = Entity::new(
            i.to_string(),
            format!("_entity{}", i),
            format!("Entity {}", i),
            "description".to_string(),
            "123".to_string(),
            "123".to_string(),
            false,
            fields.clone(),
        ).unwrap();

        entities.push(entity);
        i = i + 1;
    };


    let template = Template::new(
        "Test Template".to_string(),
        2.0,
        License::new("lic".to_string()).unwrap(),
        Config::new("config".to_string(), true, true).unwrap(),
        entities,
        "watch_lists".to_string(),
        Repository::new("My Repo".to_string(), "Database".to_string()).unwrap(),
    ).unwrap();

    // Convert the Template to a JSON string.
    let serialized = Template::serialize(template);

    // Prints serialized Template
    println!("serialized = {}", serialized);

    // Convert the JSON string back to a Template.
    let deserialized: Template = Template::deserialize(serialized);

    // Prints deserialized Template
    println!("deserialized = {:?}", deserialized);
}