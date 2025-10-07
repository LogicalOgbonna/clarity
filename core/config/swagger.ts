import {Application} from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flair Business API',
      version: '1.0.0',
      description: 'API documentation for Flair Business API',
      contact: {
        name: 'API Support',
        email: 'support@flairbusiness.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://admin.blucarbone.co/api/clarity',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'], // Path to the API docs
};

export const setupSwagger = (app: Application) => {
  console.log('Setting up Swagger...');

  // Generate Swagger specs from JSDoc comments
  const specs = swaggerJsdoc(options);

  // Setup Swagger with the generated specs
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Flair Business API Documentation',
    })
  );

  console.log('Swagger documentation available at /api/docs');
};
