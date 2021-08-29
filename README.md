[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Motivation

> FP and OO work nicely together. Both attributes are desirable as part of modern systems. A system that is built on both OO and FP principles will maximize flexibility, maintainability, testability, simplicity, and robustness. Excluding one in favor of the other can only weaken the structure of a system. - Uncle Bob.

This repository aims to provide to people an opinionated starter/example project to help them to architecture their next project.

The [Nest.js](https://nestjs.com/) framework has been chosen for its convenience as it provides out-of-the-box a light syntax for the recurrent problems:

- Dependency injection
- Event emission

This project uses OOP to handle modularity (modules instances) and on the other hand it uses the convenience of FP to write use-cases as smooth data flows while embracing eventual errors.

Functionnal Programming may look intimidating, if you are new to it, you should [read the most adequate guide](https://mostly-adequate.gitbook.io/mostly-adequate-guide/) to learn more about it.

# Project Overview

![Nest Clean Architecture](./docs/assets/nest-clean-architecture.png)

Clients interacts with the system through the [api-gateway](./api-gateway): the endpoints. The concerned module, executes the corresponding use-case which orchestrate the domain and perform I/O using its injected adapters.

The **contexts modules** are tightly **concerned by the overall goal of the application**, while the **common modules** are **business-agostic** and only serves as support to decouple logic and responsabilities in the entire system.

# Tests

## Unit tests

One of the most controversial subject in Software development is **unit testing**.

What and how should we test ?

Unit test should **focus on the business value** of your application: the use-cases.

They have to be **really fast (< x0 ms)** in order to iterate quickly on the algorithm we are working on.

In the outside world, we distinguish two approaches for unit testing: [the Classicist vs the Mockist](https://martinfowler.com/articles/mocksArentStubs.html).

This project uses the classicist approach in order to **focus on the result of the behavior of the use-cases and not on how the behavior has been implemented**: this leads to more meaningful tests, with a lighter syntax.

So, use-cases are black-boxed tested with fake secondaries adapters injected at the beginning of the test suite.

![Classicist unit testing](./docs/assets/unit-testing.png)
