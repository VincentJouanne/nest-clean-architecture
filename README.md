[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Motivation

> FP and OO work nicely together. Both attributes are desirable as part of modern systems. A system that is built on both OO and FP principles will maximize flexibility, maintainability, testability, simplicity, and robustness. Excluding one in favor of the other can only weaken the structure of a system. - Uncle Bob.

This repository aims to provide to people an opinionated starter/example project to help them to architecture their next project.

The [Nest.js](https://nestjs.com/) framework has been chosen for its convenience as it provides out-of-the-box a light syntax for the recurrent problems:

- Dependency injection
- Event emission

This project uses OOP to handle modularity (modules instances) and on the other hand it uses the convenience of FP to write use-cases as smooth data flows while embracing eventual errors.

Functionnal Programming may look intimidating, if you are new to it, you should [read the most adequate guide](https://mostly-adequate.gitbook.io/mostly-adequate-guide/) to learn more about it.

## Project Overview

![Nest Clean Architecture](./docs/assets/nest-clean-architecture.png)
