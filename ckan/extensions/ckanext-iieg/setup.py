from setuptools import find_packages, setup


setup(
    name="ckanext-iieg",
    version="0.0.1",
    description="Tema base de CKAN para IIEG",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[],
    entry_points={
        "ckan.plugins": [
            "iieg=ckanext.iieg.plugin:IIEGThemePlugin",
        ],
    },
    message_extractors={
        "ckanext": [
            ("**.py", "python", None),
            ("**/templates/**.html", "ckan", None),
        ],
    },
)
