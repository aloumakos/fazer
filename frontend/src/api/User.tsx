export class User {
    private firstName: String 
    private lastName: String
    private email: String
    private password: String

    constructor(firstName: String, lastName: String, email: String, password: String) {
        this.email = email
        this.firstName = firstName
        this.lastName = lastName
        this.password = password
    }
}