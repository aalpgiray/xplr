# xplr

Yarn script explorer helps you discover and run scripts in your yarn workspace.
It discovers all the packages with that has a matching script in the package json.
You can select the packages you want to run.

```bash
npx xplr <script-name>
```

ie:

```bash
npx xplr dev
```

### Contribution

This project is an experimentation with Effect-ts library. Effect-ts is pretty powerful library
for properly typed functional programs. It allows typing the dependencies and more importantly
allows for declaration of potential error cases. 