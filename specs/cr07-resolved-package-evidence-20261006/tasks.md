# Tasks

- [x] Prove CR-07 gap: SBOM/SCA exists but exact resolver outcome was not retained as a separate reproducibility artifact.
- [x] Reuse the existing security workflow and artifact.
- [x] Add one package-resolution evidence step.
- [x] Add the output to the existing artifact.
- [x] Preserve the existing vulnerability gate and avoid runtime/product changes.

Merge remains conditioned on Chapelgate Estate Gate. After merge, the main-branch Security CI run is retained as the execution evidence; that post-merge run is not misrepresented as already complete by this pre-merge task file.
