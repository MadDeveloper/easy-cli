/**
 * @class BundleBuilder
 */
class BundleBuilder {
    /**
     * constructor
     *
     * @param {Kernel} kernel
     */
    constructor( kernel ) {
        this.kernel = kernel
        this.bundle = new Bundle( '', kernel )
    }

    /**
     * setName - set bundle name
     *
     * @param {string} name
     *
     * @returns {BundleBuilder}
     */
    setName( name ) {
        this.bundle.rename( name )

        return this
    }

    /**
     * setSkeleton - set skeleton base
     *
     * @param {Skeleton} skeleton
     *
     * @returns {BundleBuilder}
     */
    setSkeleton( skeleton ) {
        this.bundle.defineStructureSkeleton( skeleton )

        return this
    }
}
