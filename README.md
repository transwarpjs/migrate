# transwarp-migrate

Database migration


## Usage

```sh
$ migrate -h


  Usage: migrate [options] [command]


  Commands:

    up|u [name]      migrate up
    down|d [name]    migrate down
    create|c [name]  create a new migration file with optional [name]
    status|s         list all migrations status

  Database migration for Transwarp.

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    --config [path]  Location of the database.json file.
    -e,--env <env>   The environment to run the migrations under.

```

```sh
$ migrate create -h

  Usage: create|c [options] [name]

  create a new migration file with optional [name]

  Options:

    -h, --help           output usage information
    -s, --style <style>  convert name to snake/kebab case

```
