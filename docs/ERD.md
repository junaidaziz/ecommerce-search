# Database ERD

```mermaid
erDiagram
    User {
      INT id PK
      STRING email
      STRING password
      STRING firstName
      STRING lastName
      STRING brandName
      STRING gender
      STRING role
      BOOLEAN verified
      STRING verificationToken
      STRING resetToken
      DATETIME resetExpires
      DATETIME createdAt
      DATETIME updatedAt
    }
    Category {
      INT id PK
      STRING name
      STRING slug
      DATETIME createdAt
      DATETIME updatedAt
    }
    Product {
      INT id PK
      STRING title
      STRING description
      STRING productType
      STRING tags
      INT quantity
      FLOAT minPrice
      FLOAT maxPrice
      STRING currency
      STRING status
      STRING images
      INT vendorId FK
      INT categoryId FK
      DATETIME createdAt
      DATETIME updatedAt
    }
    Order {
      INT id PK
      INT userId FK
      INT productId FK
      INT quantity
      FLOAT total
      STRING status
      DATETIME createdAt
      DATETIME updatedAt
    }
    DeletionRequest {
      INT id PK
      INT categoryId FK
      INT brandId FK
      STRING reason
      STRING status
      DATETIME createdAt
      DATETIME updatedAt
    }

    User ||--o{ Product : "has"
    User ||--o{ Order : "places"
    Category ||--o{ Product : "contains"
    Category ||--o{ DeletionRequest : "records"
    Product }o--o{ Order : "ordered in"
    User ||--o{ DeletionRequest : "requests"
```
