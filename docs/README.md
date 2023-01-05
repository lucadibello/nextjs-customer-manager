# NextJS Customer Manager

## Questions

**Install the database in the preferred format and take a look at the Customer and Employee entity data: how many records do they contain? Which employee has the most customers? Which customer has the most invoices (Invoice)?**

I used a PostgreSQL database, found on the official [GitHub repositoriy](https://github.com/lerocha/chinook-database/blob/master/ChinookDatabase/DataSources/Chinook_PostgreSql.sql).

There are only **8 employees** and **59 customers** and **Jane Peacock** has the most customers with 21.

These are the queries I used to answer the questions:

```sql
/* COUNT HOW MANY EMPLOYEES ARE IN THE DATABASE */
SELECT COUNT(*) FROM "Employee";
```

```sql
/* COUNT HOW MANY CUSTOMERS ARE IN THE DATABASE */
SELECT COUNT(*) FROM "Customer";
```

```sql
/* CHECK WHOSE EMPLOYEE HAS THE MOST CUSTOMERS (CONCAT FirstName and LastName) */
SELECT CONCAT(e."FirstName", ' ', e."LastName") AS "Employee Name", COUNT("CustomerId") AS "Number of Customers"
FROM "Employee" e INNER JOIN "Customer" c
    ON e."EmployeeId" = c."SupportRepId"
    GROUP BY e."EmployeeId"
    ORDER BY "Number of Customers" DESC
    LIMIT 1;
```

**Develop a web-based solution that can be easily converted to an android app, or be at least "mobile friendly."
The database could be extended with new entities or attributes of existing entities depending on the needs of the project.**

I used NextJS to develop the solution starting from the boilerplate created for my previous project [nextjs-jwt-auth-boilerplate](https://github.com/lucadibello/nextjs-jwt-auth-boilerplate). To implement the required logging and traceability, I used an SaaS solution called [Sentry](https://sentry.io/welcome/) which is a real-time error tracking tool that helps developers monitor and fix crashes in real time.

In addition, I decided to convert the project into a PWA ([Progressive Web App](https://web.dev/progressive-web-apps/)) to make it more like a native app. To do this, I used the [next-pwa](https://www.npmjs.com/package/next-pwa) module which is a NextJS plugin that allows you to easily add PWA features to your NextJS application. I also generated all the required maskable icons using [maskable.app](https://maskable.app/editor) and added the `manifest.json` file to the `public` folder, fixing also the [middleware.ts](../middleware.ts) file to allow the user to access the required files also when not logged in (by default, each page has protected access).
