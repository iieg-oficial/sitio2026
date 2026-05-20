ARG CKAN_BASE_IMAGE=ckan/ckan-base:2.11.5
FROM ${CKAN_BASE_IMAGE}

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

COPY ./extensions/ckanext-iieg /srv/app/src/ckanext-iieg

RUN cd /srv/app/src && \
    git clone --depth 1 -b 2.3.0 https://github.com/ckan/ckanext-xloader.git && \
    pip install --no-cache-dir -e ckanext-xloader && \
    pip install --no-cache-dir -r ckanext-xloader/requirements.txt && \
    git clone --depth 1 https://github.com/keitaroinc/ckanext-s3filestore.git && \
    pip install --no-cache-dir -e ckanext-s3filestore && \
    pip install --no-cache-dir -r ckanext-s3filestore/requirements.txt

RUN pip install --no-cache-dir cookiecutter && \
    pip install --no-cache-dir -e /srv/app/src/ckanext-iieg

USER ckan
