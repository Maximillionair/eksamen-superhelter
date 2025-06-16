# Password Security: Hashing vs. Encryption

## What is Password Hashing?

**Password hashing** is a one-way cryptographic function that converts a password into a fixed-length string of characters, which appears random. The key features of hashing are:

1. **One-way process**: You cannot derive the original password from the hash.
2. **Deterministic**: The same input always produces the same hash.
3. **Unique outputs**: Different inputs should produce different hashes (no collisions).
4. **Fixed length**: Regardless of password length, the hash is a fixed size.

In our application, we use bcrypt for password hashing, which includes:
- **Salt**: Random data added to the password before hashing
- **Cost factor**: Makes the hashing process computationally expensive to resist brute force attacks

## What is Encryption?

**Encryption** is a two-way process that converts data into a format that can be reversed back to the original data using a key. The key features are:

1. **Reversible**: With the proper key, encrypted data can be decrypted.
2. **Key-dependent**: The security relies on keeping the encryption key secure.
3. **Variable length**: The output size often depends on the input size.

## Why We Use Hashing Instead of Encryption for Passwords

1. **Security**: If a database is breached, hashed passwords cannot be reversed to reveal actual passwords.
2. **Verification without storage**: We can verify if a user entered the correct password by hashing their input and comparing it with the stored hash.
3. **Legal compliance**: Many data protection regulations recommend or require password hashing.

## Our Implementation

In our superhero application:
- When a user registers, their password is hashed using bcrypt with a salt and stored in the database.
- When a user logs in, the entered password is hashed and compared with the stored hash.
- We never store or transmit plain text passwords.

Additionally, we use JWT (JSON Web Tokens) for persistent authentication, which allows users to stay logged in across browser sessions.

## Security Best Practices We Follow

1. **Strong hashing algorithm**: We use bcrypt with a cost factor that can be adjusted as computing power increases.
2. **Salting**: Each password has a unique salt to prevent rainbow table attacks.
3. **HTTPS**: All communication is encrypted to prevent man-in-the-middle attacks.
4. **HTTP-only cookies**: JWTs are stored in HTTP-only cookies to prevent JavaScript access.
5. **Secure cookies**: In production, cookies are only sent over HTTPS.
6. **CSRF protection**: We use same-site cookie restrictions to prevent cross-site request forgery.
