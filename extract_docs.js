/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

try {
    const raw = fs.readFileSync('schema.json', 'utf8');
    const spec = JSON.parse(raw);

    const relevantPaths = {};
    const schemasToFind = new Set();

    // Find User Controller paths
    Object.keys(spec.paths).forEach(path => {
        if (path === '/api/users/school/users') {
            relevantPaths[path] = spec.paths[path];

            // Extract refs
            const methods = Object.values(spec.paths[path]);
            methods.forEach(method => {
                // Responses
                Object.values(method.responses || {}).forEach(response => {
                    if (response.content && response.content['*/*'] && response.content['*/*'].schema) {
                        const schema = response.content['*/*'].schema;
                        if (schema.$ref) {
                            const ref = schema.$ref.split('/').pop();
                            schemasToFind.add(ref);
                        }
                    }
                });
            });
        }
    });

    const extraSchemas = ['ResponseDtoListUserSchoolResponse', 'ListUserSchoolResponse', 'UserSchoolResponse'];
    extraSchemas.forEach(name => schemasToFind.add(name));

    const definitions = {};
    schemasToFind.forEach(name => {
        if (spec.components.schemas[name]) {
            definitions[name] = spec.components.schemas[name];
        }
    });

    console.log(JSON.stringify({ paths: relevantPaths, definitions }, null, 2));

} catch (err) {
    console.error(err);
}
