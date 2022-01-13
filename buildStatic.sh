# this build script will only build the static part (without the Spring Boot backend)
# this is kind of a hack, but right now the easiest way to generate a static version
# from a shared code basis

# copy sources
rm -rf tmp/
mkdir tmp/

cp -r src/main/js/ tmp/
cp webpack.config.js package.json tsconfig.json package-lock.json cypress.json tmp/

mkdir tmp/resources/
cp -r src/main/resources/{models,static} tmp/resources/
cp src/main/resources/templates/main.html tmp/resources/static/index.html

# copy e2e tests, but delete those which depend on the backend
cp -r cypress tmp/
rm tmp/cypress/integration/{auth,canvas,ui}.js

# patch the main component
cd tmp || exit 1

sed -i 's/MultiJSnake/aiSnake/g' js/App.tsx
sed -i 's|"/ai"|"/ai", "/"|g' js/App.tsx
sed -i 's|./src/main/js/App.tsx|./js/App.tsx|g' webpack.config.js
sed -i 's|path: __dirname + "/src/main/resources/static/built"|path: __dirname + "/resources/static/built"|g' webpack.config.js
sed -i 's|xmlns:th="http://www.thymeleaf.org"||g' resources/static/index.html
sed -i '/th:content/d' resources/static/index.html

sed -i 's|cy.visit("/ai");|cy.visit("/");|'g cypress/integration/ai.js

python3 << EOF
def snip(filename):
  with open(filename) as f:
    buffer = []
    skip = False
    for line in f:
      if '@skip-for-static-start' in line:
        skip = True
      if not skip:
        buffer.append(line)
      if '@skip-for-static-end' in line:
        skip = False
  with open(filename, "w") as f:
    f.write("".join(buffer))
from glob import glob
for file in glob("js/**/*.[tj]s*", recursive=True):
  snip(file)
EOF

# build
npm install || exit 1
npm run build || exit 1

echo "build finished"
echo "now deploy the folder 'tmp/resources/static'"
echo "or serve it locally: 'python3 -m http.server 8080'"
