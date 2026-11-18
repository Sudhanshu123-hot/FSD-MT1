# College Event Registration API

A REST API built with Node.js and Express. Registration data is stored in a JavaScript array in memory and resets when the server restarts.

## Run

```bash
npm install
npm start
```

The server listens on `http://localhost:3000` by default. Set the `PORT` environment variable to use another port.

## Endpoints

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/registrations` | List all registrations |
| POST | `/api/registrations` | Create a registration; the API generates the numeric ID |
| GET | `/api/registrations/:id` | Get one registration |
| PUT | `/api/registrations/:id` | Replace a registration; all fields except `id` are required |
| DELETE | `/api/registrations/:id` | Delete a registration |
| GET | `/api/registrations/filter?department=CSE` | Filter by department, case-insensitively |
| GET | `/api/registrations/pending` | List registrations with `paymentStatus: "Pending"` |
| POST | `/api/registrations/:id/cancel-pending` | Remove the registration if its payment is still pending; paid registrations return 409 |

POST and PUT require `participantName`, `eventName`, and `department` as non-empty strings, `ticketCount` as a positive integer, and `paymentStatus` as exactly `Paid` or `Pending`. Invalid bodies return HTTP 400. Missing registrations return HTTP 404.

## Sample POST body

```json
{
  "participantName": "Karan Singh",
  "eventName": "AI Workshop",
  "department": "CSE",
  "ticketCount": 2,
  "paymentStatus": "Pending"
}
```

## Initial registrations

The API starts with the three records from the assessment brief: Riya Sharma (ID 501), Arjun Mehta (ID 502), and Neha Verma (ID 503).
