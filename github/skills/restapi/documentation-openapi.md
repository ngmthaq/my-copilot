# API Documentation / OpenAPI

## Core Rule

Document every public endpoint. Good documentation reduces integration time and support requests.

---

## OpenAPI Basics

OpenAPI (formerly Swagger) is the standard for describing REST APIs in a machine-readable YAML or JSON file.

A minimal OpenAPI 3.0 spec:

```yaml
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List all users
      tags:
        - Users
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        "200":
          description: Users retrieved successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserListResponse"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "500":
          $ref: "#/components/responses/InternalServerError"
```

---

## Reusable Components

Define shared schemas and responses once, then reference them with `$ref`.

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 42
        name:
          type: string
          example: Alice Smith
        email:
          type: string
          format: email
          example: alice@example.com
        createdAt:
          type: string
          format: date-time

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: RESOURCE_NOT_FOUND
            message:
              type: string
              example: User with id 42 was not found.
            details:
              type: array
              items: {}

  responses:
    Unauthorized:
      description: Missing or invalid authentication token
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"

    InternalServerError:
      description: Unexpected server error
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
```

---

## Code-Based Examples

### Express.js — swagger-jsdoc + swagger-ui-express

**Install:**

```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

**Setup (`src/swagger.ts`):**

```typescript
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "My API", version: "1.0.0" },
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/**/*.ts"], // files with JSDoc annotations
});
```

**Register in `src/app.ts`:**

```typescript
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

**Annotate a route with JSDoc:**

```typescript
/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/users", authMiddleware, listUsersHandler);
```

---

### NestJS — @nestjs/swagger decorators

**Install:**

```bash
npm install @nestjs/swagger
```

**Setup in `main.ts`:**

```typescript
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("My API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(3000);
}
```

**DTO with decorators:**

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "Alice Smith" })
  name: string;

  @ApiProperty({ example: "alice@example.com" })
  email: string;

  @ApiProperty({ example: "password123", minLength: 8 })
  password: string;
}
```

**Controller with decorators:**

```typescript
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  @Get()
  @ApiOperation({ summary: "List all users" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: "Create a user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

---

## Documentation Checklist (per endpoint)

- [ ] Summary — one-line description of what the endpoint does
- [ ] Tag — groups the endpoint by resource (e.g., `Users`, `Orders`)
- [ ] Parameters — all path, query, and header params documented with types and examples
- [ ] Request body — schema with required fields and examples
- [ ] Responses — at least `200`/`201`, `400`, `401`, `403`, `404`, `500`
- [ ] Security — `BearerAuth` applied to protected endpoints

---

## Rules

- Document **all endpoints**, including auth and error responses.
- Use `example` values in schemas so Swagger UI shows useful samples.
- Group endpoints with `tags` (one tag per resource).
- Use `$ref` for reusable schemas — do not repeat schema definitions inline.
- Always document **error responses** for each endpoint, not just success.
- Keep the OpenAPI spec committed to the repository and up to date.
