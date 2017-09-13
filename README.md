# WPSN Knex 튜토리얼

Node.js를 통해 MySQL을 이용하는 방법에는 아래와 같이 여러 가지가 있습니다.

1. 쿼리를 직접 작성한 후 실행 ([mysql](https://www.npmjs.com/package/mysql), ...)
1. 쿼리 빌더를 통해서 쿼리 실행 ([Knex.js](http://knexjs.org/), [Squel.js](https://hiddentao.com/squel/), ...)
1. ORM(Object)을 통해서 쿼리 실행 ([Sequelize](http://docs.sequelizejs.com/), [Bookshelf.js](http://bookshelfjs.org/), [Objection.js](http://vincit.github.io/objection.js/), ...)

실무에서는 1번 방식을 사용하는 경우는 거의 없고, 주로 2번 방식과 3번 방식을 사용합니다.

쿼리 빌더는 쿼리를 직접 작성하는 대신 프로그래밍 언어로 작성된 API를 이용해 간접적으로 쿼리를 작성하는 방식을 말합니다. 쿼리 빌더를 사용하면 쿼리의 조합과 재사용을 유연하고 편리하게 할 수 있습니다.

ORM(Object Relational Mapping)은 데이터베이스를 객체 지향 프로그래밍을 통해 다룰 수 있게 만들어주는 도구입니다. Validation 등의 부가 기능을 내장하고 있는 경우가 많으며 테이블 간의 관계도 편하게 다룰 수 있으나, 잘 사용하게 되기까지 필요한 학습 비용이 높다는 단점이 있습니다.

이 강의에서 사용할 Knex.js는 Node.js와 브라우저 위에서 사용가능한 쿼리 빌더입니다. SQL과 비슷한 형태의 문법을 가지고 있고, 또 마이그레이션 기능을 내장하고 있어 널리 사용되고 있습니다. 또한 MySQL, Postgres, MSSQL, Oracle과 같은 유명한 DBMS를 지원합니다.

## 목차

1. [Knex - Query Builder](queryBuilder.md)
1. [Knex - Schema Builder](schemaBuilder.md)