/**
 * @class BundleBuilder
 */
class BundleBuilder {
    constructor( kernel ) {
        this.kernel = kernel
        this.bundle = new Bundle( '', kernel )
    }

    setName( name ) {
        this.bundle.name = name
    }

    setSkeleton( skeleton ) {
        this.bundle.skeleton = skeleton
    }
}
