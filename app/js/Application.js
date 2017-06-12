class Application {
    init() {
        // instantiate a loader
        let e = document.getElementById('cityimage');
        let tex = new THREE.Texture( e );
        tex.needsUpdate = true;
        tex.minFilter = THREE.LinearFilter;
        // debugger;
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 'black', linewidth: 2 });
        this.imageMaterial = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
        this.dotMaterial = new THREE.MeshStandardMaterial({color: 'red'});
        this.initGui();
        this.applyGuiChanges();
    }

    applyGuiChanges() {
        this.sceneManager.scene.remove(this.lines);
        this.sceneManager.scene.add(this.lines = new THREE.LineSegments(new THREE.Geometry(), this.lineMaterial));
        let halfy = this.rows * this.matHeight / 2;
        for (var i = -this.columns / 2; i <= this.columns / 2; ++i) {
            let x = i * this.matWidth;
            this.lines.geometry.vertices.push(new THREE.Vector3(x, halfy, 0), new THREE.Vector3(x, -halfy, 0));
        }
        let halfx = this.columns * this.matWidth / 2;
        for (var i = -this.rows / 2; i <= this.rows / 2; ++i) {
            let y = i * this.matHeight;
            this.lines.geometry.vertices.push(new THREE.Vector3(halfx, y, 0), new THREE.Vector3(-halfx, y, 0));
        }

        this.sceneManager.scene.remove(this.plane);
        const geom = new THREE.PlaneGeometry(this.columns * this.matWidth, this.rows * this.matHeight);
        this.sceneManager.scene.add(this.plane = new THREE.Mesh(geom, this.imageMaterial));
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
        this.addParam('rows', 65).name('Rows').min(2).max(100).step(1).onChange(this.applyGuiChanges);
        this.addParam('columns', 20).name('Columns').min(2).max(100).step(1).onChange(this.applyGuiChanges);
        this.addParam('matHeight', 0.61).name('Mat height').min(0.1).max(3.0).step(0.001).onChange(this.applyGuiChanges);
        this.addParam('matWidth', 1.73).name('Mat width').min(0.1).max(3.0).step(0.001).onChange(this.applyGuiChanges);
    }

    onMouseMove(inter) {
        inter = inter.filter(t => t.object === this.plane);
        if (inter.length === 0) return;
        this.sceneManager.scene.remove(this.dot);
        this.sceneManager.scene.add(this.dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), this.dotMaterial));
        this.dot.position.copy(inter[0].point);
    }

    addParam(name, defaultValue, ...args) {
        this[name] = defaultValue;
        return this.gui.add.apply(this.gui, [this, name].concat(args));
    }
}
