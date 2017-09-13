# Knex - Query Builder

## Knex 인스턴스 생성

Knex를 이용해 MySQL 서버에 접속하기 위해서는 일단 아래와 같이 Knex 인스턴스를 만들어야 합니다.

```js
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root', // 실제 서비스에서는 root 계정을 사용하지 않는 것이 좋습니다.
    password: 'rootpassword',
    database: 'employees'
  }
})
```

## Connection Pool

Knex 인스턴스를 생성하면 connection pool이 만들어집니다. 한 번에 여러 커넥션을 맺어 놓는다는 의미. 그래서 해당 커넥션을 이용해

인스턴스 생성 시 별도의 옵션을 주지 않는다면 커넥션 풀은 2개의 커넥션으로 시작하며, 필요에 의해 10개까지 늘어날 수 있습니다. 자세한 설정은 공식문서를

## Knex를 이용한 쿼리 수행

이제부터 Knex 인스턴스를 이용해 쿼리를 날릴 수 있습니다.

**주의!** 레코드가 수 십만 개 이상인 경우에는 결과를 받아오는 데 시간이 오래 걸리니 꼭 limit 메소드를 사용해주세요.

```js
knex('salaries').limit(3).then(console.log)

// 결과
[ { emp_no: 10001,
    salary: 60117,
    from_date: 1986-06-25T15:00:00.000Z,
    to_date: 1987-06-25T14:00:00.000Z },
  { emp_no: 10001,
    salary: 62102,
    from_date: 1987-06-25T14:00:00.000Z,
    to_date: 1988-06-24T14:00:00.000Z },
  { emp_no: 10001,
    salary: 66074,
    from_date: 1988-06-24T14:00:00.000Z,
    to_date: 1989-06-24T15:00:00.000Z } ]
```

Knex 인스턴스는 [메소드 체이닝](https://en.wikipedia.org/wiki/Method_chaining) 방식으로 사용하도록 만들어져 있습니다. 아래와 같이 메소드를 계속 이어붙이는 방식으로 쿼리를 빌드합니다.

```js
// 1위부터 10위까지의 최고 연봉자의 연봉과 first_name을 출력합니다.
knex('employees')
  .select('first_name')
  .max('salary as max_salary')
  .join('salaries', 'employees.emp_no', 'salaries.emp_no')
  .groupBy('salaries.emp_no')
  .orderBy('max_salary', 'desc')
  .limit(10)
  .then(...)
```

Knex 인스턴스는 표준 Promise가 아니라 자체 Promise 구현을 사용합니다. 이 구현의 특이한 점은 `then` 메소드를 호출하기 전까지는 SQL을 실행시키지 않는다는 것입니다.

위 성질을 이용해 `then` 메소드를 호출하지 않은 채로 `toString` 메소드를 호출하면, 쿼리를 실행시키기 전에 쿼리 빌더가 어떤 쿼리를 생성하는지 알 수 있습니다.

```js
knex('salaries').limit(3).toString()
// select * from `salaries` limit 3
```

## SELECT

`select` 메소드를 사용하면 원하는 컬럼만을 불러올 수 있습니다.

```js
knex('salaries')
  .select('emp_no', 'salary')
  .limit(3)
  .toString()
// select `emp_no`, `salary` from `salaries` limit 3
```

실제로 쿼리를 실행하면 아래와 같은 결과를 반환합니다.

```js
knex('salaries')
  .select('emp_no', 'salary')
  .limit(3)
  .then(console.log)

// 결과
[ { emp_no: 10001, salary: 60117 },
  { emp_no: 10001, salary: 62102 },
  { emp_no: 10001, salary: 66074 } ]
```

`select` 메소드의 인자로 넘기는 문자열 뒤에 `as`를 붙여서, 반환되는 객체들의 속성 이름을 바꿀 수 있습니다.

```js
knex('salaries')
  .select('emp_no as e', 'salary as s')
  .limit(3)
  .then(console.log)

// 결과
[ { e: 10001, s: 60117 },
  { e: 10001, s: 62102 },
  { e: 10001, s: 66074 } ]
```

`distinct` 메소드를 사용해 중복 제거를 할 수 있습니다.

```js
knex('employees')
  .distinct('first_name')
  .limit(3)
  .toString()

/*
select distinct `first_name` from `employees`
limit 3
*/
```

## WHERE

`where` 메소드를 이용해 `WHERE` 구문을 빌드할 수 있습니다.

```js
knex('salaries')
  .where('emp_no', 20000)
  .limit(3)
  .toString()

/*
select * from `salaries`
where `emp_no` = 20000
limit 3
*/
```

아래와 같이 연산자를 사용할 수도 있습니다.

```js
knex('salaries')
  .where('emp_no', '>', 20000)
  .limit(3)
  .toString()

/*
select * from `salaries`
where `emp_no` > 20000
limit 3
*/
```

`AND` 연산자를 사용하기 위해 `where` 메소드를 여러 번 사용하거나, `andWhere` 메소드를 사용할 수 있습니다.

```js
knex('salaries')
  .where('emp_no', '>', 20000)
  .where('salary', '>', 150000)
  .andWhere('from_date', '<', '1999-01-01')
  .limit(3)
  .toString()

/*
select * from `salaries`
where `emp_no` > 20000
  and `salary` > 150000
  and `from_date` < '1999-01-01'
limit 3
*/
```

또는 `where` 메소드에 객체를 넘길 수도 있습니다.

```js
knex('employees')
  .where({
    first_name: 'Georgi',
    last_name: 'Facello'
  })
  .toString()

/*
select * from `employees`
where `first_name` = 'Georgi' and `last_name` = 'Facello'
*/
```

`NOT` 연산자를 사용하기 위해서 `whereNot` 메소드를 사용합니다.

```js
knex('salaries')
  .whereNot('emp_no', '>', 20000)
  .limit(3)
  .toString()

/*
select * from `salaries`
where not `emp_no` > 20000
limit 3
*/
```

`OR` 연산자를 사용하기 위해 `orWhere` 메소드를 사용할 수 있습니다. 또한 연산이 복잡한 경우에는 함수를 인자로 넘겨서 여러 `where`의 결합을 나타낼 수 있습니다.

```js
knex('salaries')
  .where(function() {
    // arrow function을 사용하면 안 됩니다!
    this
      .where('emp_no', '>', 20000)
      .andWhere('salary', '>', 150000)
  })
  .orWhere(function() {
    this
      .where('emp_no', '<', 11000)
      .andWhere('salary', '<', 60000)
  })
  .limit(3)
  .toString()

/*
select * from `salaries`
where (`emp_no` > 20000 and `salary` > 150000)
  or (`emp_no` < 11000 and `salary` < 60000)
limit 3
*/
```

그 밖에 아래와 같은 메소드들이 있습니다.

- `whereIn`
- `whereNotIn`
- `whereNull`
- `whereNotNull`
- `whereExists`
- `whereNotExists`
- `whereBetween`
- `whereNotBetween`
- `andWhereNot`
- `orWhereNot`

자세한 사용법은 [공식 문서](http://knexjs.org/#Builder-wheres)를 참고해주세요.

## INSERT

```js
knex('employees')
  .insert({
    emp_no: 876543,
    first_name: 'fast',
    last_name: 'campus',
    birth_date: '1960-01-01',
    hire_date: '1980-01-01',
    gender: 'M'
  })
  .toString()

/*
insert into `employees` (`birth_date`, `emp_no`, `first_name`, `gender`, `hire_date`, `last_name`)
values ('1960-01-01', 876543, 'fast', 'M', '1980-01-01', 'campus')
*/
```

## UPDATE

```js
knex('employees')
  .where({emp_no: 876543})
  .update({last_name: 'five'})
  .toString()

/*
update `employees`
set `last_name` = \'five\'
where `emp_no` = 876543
*/
```

## DELETE

```js
knex('employees')
  .where({emp_no: 876543})
  .delete()
  .toString()

/*
delete from `employees`
where `emp_no` = 876543
*/
```

## ORDER BY

`orderBy` 메소드를 사용해서 `ORDER BY` 구문을 빌드할 수 있습니다.

```js
knex('employees')
  .orderBy('first_name', 'desc')
  .orderBy('last_name')
  .limit(3)
  .toString()

/*
select * from `employees`
order by `first_name` desc, `last_name` asc
limit 3
*/
```

## LIMIT, OFFSET

`limit`, `offset` 메소드를 사용해서 각각 `LIMIT`, `OFFSET` 구문을 빌드할 수 있습니다.

```js
knex('employees')
  .limit(3)
  .offset(100)
  .toString()

/*
select * from `employees`
limit 3 offset 100
*/
```

## 집계함수

Knex 인스턴스의 `count`, `max`, `min`, `sum`, `avg`등의 메소드를 통해 집계함수를 빌드할 수 있습니다.

```js
knex('salaries')
  .count('*')
  .toString()

/*
select count(*) as `c` from `salaries`
*/
```

```js
knex('salaries')
  .max('salary')
  .toString()

/*
select max(*) as `m` from `salaries`
*/
```

집계함수의 인자로 넘기는 문자열 뒤에 `as`를 붙여서, 반환되는 객체들의 속성 이름을 바꿀 수 있습니다.

```js
knex('salaries')
  .max('salary')
  .then(console.log)

// 결과
[ { 'max(`salary`)': 158220 } ]
```

```js
knex('salaries')
  .max('salary as s')
  .then(console.log)

// 결과
[ { s: 158220 } ]
```

## GROUP BY & HAVING

`groupBy` 메소드를 통해 `GROUP BY` 구문을 빌드할 수 있습니다. 보통 위에서 다뤘던 집계함수와 함께 사용합니다.

```js
knex('salaries')
  .select('emp_no')
  .max('salary as max_salary')
  .groupBy('emp_no')
  .limit(10)
  .toString()

/*
select `emp_no`, max(`salary`) as `max_salary`
from `salaries`
group by `emp_no`
limit 10
*/
```

`having` 메소드를 통해 `HAVING` 구문을 빌드할 수 있습니다. 사용법은 `where` 메소드와 비슷합니다.

```js
knex('salaries')
  .select('emp_no')
  .max('salary as max_salary')
  .groupBy('emp_no')
  .having('max_salary', '>', 150000)
  .toString()

/*
select `emp_no`, max(`salary`) as `max_salary`
from `salaries`
group by `emp_no`
having `max_salary` > 150000
*/
```

## JOIN

`join` 메소드를 이용해 `INNER JOIN` 구문을 빌드할 수 있습니다.

```js
knex('employees')
  .select('first_name', 'salary')
  .join('salaries', 'employees.emp_no', 'salaries.emp_no')
  .limit(10)
  .toString()

/*
select `first_name`, `salary` from `employees`
inner join `salaries` on `employees`.`emp_no` = `salaries`.`emp_no`
limit 10
*/
```

이 밖에 조인과 관련된 여러 메소드를 지원합니다.

- `leftOuterJoin`
- `rightOuterJoin`
- `fullOuterJoin`

자세한 사용법은 [공식 문서](http://knexjs.org/#Builder-join)를 참고해주세요.

## 서브쿼리

단일 행 서브쿼리, 다중 행 서브쿼리 모두 자연스러운 방식으로 사용할 수 있습니다. Knex 인스턴스를 통해 작성한 쿼리 객체를, `where` 혹은 `whereIn` 메소드의 인자로 사용할 수 있습니다.

```js
// 1999년도 이전의 최고연봉보다 더 많은 연봉을 받은 사람들의 사원 번호를 출력합니다.
const subquery = knex('salaries')
  .max('salary')
  .where('from_date', '<', '1999-01-01')

knex('salaries')
  .distinct('emp_no')
  .where('salary', '>', subquery)
  .toString()

/*
select distinct `emp_no` from `salaries`
where `salary` > (
  select max(`salary`) from `salaries`
  where `from_date` < '1999-01-01'
)
*/
```

```js
// first_name = 'Georgi' 를 만족하는 사람들의 last_name을 출력합니다.
const subquery = knex('employees')
  .select('emp_no')
  .where('first_name', 'Georgi')

knex('employees')
  .select('last_name')
  .whereIn('emp_no', subquery)
  .toString()

/*
select `last_name` from `employees`
where `emp_no` in (
  select `emp_no` from `employees`
  where `first_name` = 'Georgi'
)
*/
```

## Utility Functions

### .first()

Knex를 통해 쿼리를 실행하면 보통 배열이 반환됩니다. 이것은 `limit(1)` 처럼 하나의 행이 반환될 것이 확실한 경우에도 마찬가지입니다.

```js
knex('employees')
  .select('emp_no')
  .limit(1)
  .then(console.log)

// 결과
[ { emp_no: 10001 } ]
```

매 번 하나의 행이 들어있는 배열을 다루는 것은 불편하므로, 아래와 같이 Knex 인스턴스의 `first` 메소드를 이용해서 배열이 아닌 객체가 반환되도록 동작을 바꿀 수 있습니다.

```js
knex('employees')
  .select('emp_no')
  .first()
  .then(console.log)

// 결과
{ emp_no: 10001 }
```

만약 반환된 행이 없다면 `first`의 결과는 `undefined`가 됩니다.

### .raw()

MySQL과 같은 DBMS에는 기능이 굉장히 많고, 또 버전이 올라가면서 추가되는 기능들도 많습니다. Knex에는 많은 기능들이 내장되어 있지만, DBMS의 모든 기능을 지원하는 것은 아닙니다. Knex가 지원하지 않는 기능(내장함수 등)을 Knex를 통해 사용하기 위해서는 직접 쿼리를 작성하는 작업이 필요한데, 이를 위해 Knex는 아래와 같은 메소드들을 가지고 있습니다.

- `raw`
- `whereRaw`
- `joinRaw`
- `havingRaw`
- `groupByRaw`
- `orderByRaw`

이 중 `raw` 메소드를 이용하면 직접 작성한 쿼리를 여러 메소드에서 사용할 수 있습니다. 아래의 예제를 참고해주세요.

```js
knex('users')
  .select(knex.raw('count(*) as user_count, status'))
  .where(knex.raw(1))
  .orWhere(knex.raw('status <> ?', [1]))
  .groupBy('status')
```

**주의!** 위 예제와 같이 `raw` 관련 메소드들 특별한 방식으로 쿼리에 변수를 삽입하게 만들어져 있습니다. 쿼리 내에 변수를 삽입하고 싶은 경우에는 **반드시** `raw` 메소드가 제공하는 방법을 통해서 해야 합니다.

예를 들어, 위 예제의 `orWhere` 안에 있는 `raw` 메소드를 아래와 같이 작성할 수도 있을 것입니다.

```js
// 주의!
const status = [1]
knex.raw(`status <> ${status}`)
// 이렇게 하면 절.대.로 안됩니다.
```

위와 같이 작성된 코드는 [SQL injection 공격](https://ko.wikipedia.org/wiki/SQL_%EC%82%BD%EC%9E%85)에 무방비로 노출되게 됩니다. 따라서, 쿼리 문자열 내에 변수를 삽입할 때는 **절대로 ES2015의 template literal을 사용하지 마시고,** `raw` 메소드가 제공하는 방식을 사용하세요.

`raw` 메소드의 자세한 사용법은 [공식 문서](http://knexjs.org/#Raw)를 참고해주세요.
