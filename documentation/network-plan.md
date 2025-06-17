# Network Infrastructure Documentation

## IP Plan

| Service    | IP Address      | Role                        | Machine Type       |
|------------|-----------------|-----------------------------|--------------------|
| Web Server | 10.12.87.68     | Express application server  | Ubuntu VM          |
| Database   | 10.12.87.70     | MongoDB database server     | Ubuntu VM          |
| DNS        | 10.12.87.10     | DNS server                  | Ubuntu VM          |

## Network Diagram

```
                                  Internet
                                      │
                                      ▼
                              ┌───────────────┐
                              │   Firewall    │
                              │ 192.168.1.1/24│
                              └───────┬───────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │  Internal Network Switch│
                        └──┬─────────┬─────────┬──┘
                           │         │         │
                           ▼         ▼         ▼
             ┌───────────────┐ ┌─────────┐ ┌─────────┐                             
             │  Web Server   │ │ Database│ │   DNS   │
             │10.12.87.68/24 │ │10.12.87.│ │10.12.87 │
             │               │ │70/24    │ │.10/24   │
             └───────────────┘ └─────────┘ └─────────┘

```

### SSH Security

1. **Key-based Authentication**:
   - Disable password authentication
   - Use SSH key pairs for authentication

2. **SSH Configuration**:
   - Change default port from 22 to custom port
   - Disable root login
   - Limit user access
   - Implement fail2ban for brute force protection

3. **Access Control**:
   - Implement IP-based access restrictions
   - Set up jump server for secure remote access

### Application Security

1. **Input Validation**: 
   - Validate all user inputs using express-validator middleware
   - Sanitize inputs to prevent XSS attacks

2. **Authentication**: 
   - Password hashing with bcrypt
   - Session management with secure cookies
   - CSRF protection for forms

3. **Database Security**:
   - Database user with least privileges
   - No direct internet access to database server
   - Regular backups

## Backup Strategy

- Daily automated backups of database
- Weekly full system backups of all VMs
- Backups stored on separate storage system
- Regular testing of backup restoration
