---
layout: two-cols
---

# What is a container

<v-clicks>

- A container provides a lightweight abstraction for running application in an
  isolated environment
  - they share the host kernel instead of having a full copy of an OS
- It is useful for
  - handling dependencies
  - mitigating the risk of supply chain attack
  - working securely with AI coding agents
- **Docker** is the industry standard of container technology
  - Open Container Initiative (OCI) standardises containers across different
    implementation

</v-clicks>

::right::
<div class="pl-4 flex items-center justify-center h-full">
  <img src="./img/docker_virtualisation.png" class="max-h-80" alt="Container virtualisation" />
</div>

---

# Docker glossary

<div class="pb-1">
A container <b>image</b> is the template and a <b>container</b> is a running
instance.
</div>

<div class="flex items-center justify-center mt-4">
  <img src="./img/docker_relationship.png" class="max-h-86" alt="Docker glossary" />
</div>

---

# Docker command-line interface

- Docker is primarily used via the **command line** (Docker Desktop also available)
- `docker image` manage images (`ls`, `pull`, `build`, `rm`)
  - `docker image ls` lists locally available images
- `docker container` manage containers (`run`, `ls`, `stop`, `rm`)
  - `docker container ls` show running containers
- Images and containers consume disk space and can be cleaned up by `docker system prune`

---
layout: two-cols
---

# Running Docker containers

<v-clicks>

- `docker image pull` downloads images from a registry
- `docker container run` creates and starts a container from an image
- `-it` flags for **interactive terminal** sessions
- `--rm` flag to **auto-remove** the container on exit

</v-clicks>

<div class="mt-4">

```console
$ docker image pull python:3.14-slim
$ docker image ls
REPOSITORY   TAG         IMAGE ID       SIZE
python       3.14-slim   486b8092bfb1   145MB

$ docker container run --rm -it python:3.14-slim
Python 3.14.3 (main, Feb 10 2026, 19:07:21)
>>> print("Hello from Docker!")
Hello from Docker!
```

</div>

::right::
<div class="pl-4 flex items-center justify-center h-full">
  <img src="./img/docker_run.png" class="max-h-80" alt="Running Docker containers" />
</div>

---
layout: two-cols
---

# Docker Hub

<v-clicks>

- Docker Hub is the default **public registry** for container images
- Provides documentation, tags, and usage examples for images
- Naming convention: `OWNER/IMAGE[:TAG]` (default tag: `latest`)
- **Prefer pinned tags** over `latest` for reproducibility
- Rate limits: 100 pulls/6h (unauthenticated), 200 pulls/6h (authenticated)
- Alternative registries: GHCR (GitHub), GCR (Google), Quay.io (Red Hat)

</v-clicks>

::right::
<div class="pl-4 flex items-center justify-center h-full">
  <img src="./img/dockerhub_python.png" class="max-h-80 -mt-32 rounded shadow" alt="Docker Hub Python page" />
</div>

<div v-click class="-mt-32 border border-teal-500 rounded p-2 text-sm text-teal-700">

Example: `docker pull python:3.14-slim` pulls the official Python image with the `3.14-slim` tag from Docker Hub.

</div>

---
layout: two-cols
---

# Dockerfiles and building images

<v-clicks>

- **Dockerfiles** specify the contents of a container image
- `docker image build` builds an image from a Dockerfile
- **FROM**: sets the base image
- **RUN**: executes commands (install deps)
- **COPY**: includes files from the host
- **CMD**: default command when container runs
- Each instruction creates a cached **layer**

</v-clicks>

::right::
<div class="pl-4 pt-8">

```dockerfile {*|*|1-2|4-10|12-13|15|*}{at:2}
# set the base image
FROM python:3.14-slim

# install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    figlet && rm -rf /var/lib/apt/lists/*

# install pyfiglet
RUN pip install --no-cache-dir pyfiglet

# copy entrypoint from host
COPY hello_world.py .

CMD ["python", "hello_world.py"]
```

</div>

---

# Dockerfile best practices

<v-clicks>

- **Order layers by changing frequency**: rarely changed deps first, source code last
- Combine `RUN` commands to reduce layer count
- Run as a **non-root user** for security
- Prefer `COPY` over `ADD` unless you need to deal with remote files
- Prefer `ADD` over `RUN wget ...`/`RUN curl ...` for better build cache
- Use `.dockerignore` to exclude unnecessary and **secret** files (`.git/`, `.env/`, API keys etc.)
- Use **multi-stage builds** to keep final images small

</v-clicks>

<div v-click class="mt-2">

```dockerfile
# build stage (full compiler toolchain)
FROM gcc:15 AS builder
COPY hello.c .
RUN gcc -o hello -static hello.c

# runtime stage (only binary)
FROM alpine:3.24
COPY --from=builder /hello /hello
USER dumbledore
CMD ["/hello"]
```

</div>

---

# Reproducibility and sharing

<v-clicks>

- Docker preserves the computational environment for reproducibility
- **Always build from a Dockerfile**: interactive sessions for testing
- **Pin base images** by digest for full reproducibility
  - `FROM python:3.14-slim@sha256:486b8092bfb1...`
- **Docker Hub** allows sharing but has limitations
  - Rate limits on pulls, tags can be overwritten
  - Not suitable for long-term archiving
- **Zenodo** supports uploads up to 50 GB with persistent DOIs
  - Ideal for citing containers in publications
- Keep Dockerfiles in **version control** alongside your code

</v-clicks>

---
layout: two-cols-header
---

# When to use Docker

::left::
<div class="pr-3">

<div v-click>

### Good fit

</div>

<v-clicks>

- Consistent dev environments across OS
- Microservices and web applications
- CI/CD pipelines
- Testing across different dependency versions
- Rapid deployment
- Preserving legacy applications

</v-clicks>

</div>

::right::
<div class="pl-3">

<div v-click>

### Limitations

</div>

<v-clicks>

- HPC clusters (requires root daemon)
- GPU/MPI at scale
- shared systems

</v-clicks>

<div v-click class="mt-4 border border-teal-500 rounded p-3 text-sm text-teal-700">
For HPC at Oxford ARC, use <strong>Apptainer</strong> instead.
</div>

</div>

---
layout: two-cols
---

# Apptainer (formerly Singularity)

<div class="pr-4">

- Rebranded under the **Linux Foundation** in 2021
- Designed for **HPC** and shared systems
- **Daemonless**: runs in user space, no root required
- Builds to a single **SIF** file
  - Immutable, portable, cryptographic signing
- Can pull and convert Docker/OCI images directly
- Available on **Oxford ARC** and most HPC systems

```console
$ apptainer pull docker://python:3.14-slim
$ apptainer run python_3.14-slim.sif
$ apptainer shell python_3.14-slim.sif
$ apptainer run --nv gpu_app.sif
```

</div>

::right::

<div class="pl-4">

<div class="flex justify-center mt-2 mb-2 mb-2 mb-2">
  <img src="./img/logo_apptainer.svg" class="h-16" alt="Apptainer logo" />
</div>

```text
Bootstrap: docker
From: python:3.14-slim

%files
    hello_world.py /opt/hello_world.py

%post
    # install system dependencies
    apt-get update
    apt-get install -y --no-install-recommends figlet
    rm -rf /var/lib/apt/lists/*

    # install pyfiglet
    pip install --no-cache-dir pyfiglet

%runscript
    exec python /opt/hello_world.py "$@"
```

</div>

---

# Docker vs Apptainer

| | **Docker** | **Apptainer** |
|---|---|---|
| **Architecture** | Daemon-based (root) | Daemonless (user space) |
| **Isolation** | Full namespace separation | Shared host filesystem access |
| **Image format** | Layered OCI images | Single SIF file |
| **GPU support** | Via NVIDIA Container Toolkit | Native `--nv` flag |
| **Best for** | Cloud, CI/CD, microservices | HPC, shared clusters |

<div v-click class="mt-8">

- **Podman**: rootless, daemonless Docker-compatible alternative
- Common workflow: **build with Docker** locally, **run with Apptainer** on HPC
- Apptainer pulls Docker images directly: `apptainer pull docker://...`

</div>

<style>
th, td { padding: 0.2em 0.5em; }
th { border-bottom: 2px solid #888; }
</style>

---

# Practical session

- Introduction to Docker course on the training website
- Further Software Carpentry material on:
  - Containers on GitHub Actions
  - Containers on HPC with Apptainer
- Help with containerising your own code
