class Application {
    init() {
        // instantiate a loader
        let e = document.getElementById('cityImage');
        let tex = new THREE.Texture(e);
        tex.needsUpdate = true;
        tex.minFilter = THREE.LinearFilter;
        // debugger;
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 'black', linewidth: 1 });
        this.imageMaterial = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
        this.dotMaterial = new THREE.MeshStandardMaterial({ color: 'red' });
        this.initGui();
        this.applyGuiChanges();

        this.addMesh(new THREE.PlaneGeometry(100, 100), [0, 0, -0.01]); // ground
        this.addMesh(new THREE.PlaneGeometry(15, 90), [42.5, 0, -0.005], 'cyan'); // pool
        this.addMesh(new THREE.PlaneGeometry(20, 20), [-40, -40, -0.005], 'cyan'); // fish pool
        this.addMesh(new THREE.PlaneGeometry(20, 20), [42.5, 30, 4]).rotation.y = -Math.PI / 8; // stairs
        this.addMesh(new THREE.PlaneGeometry(40, 10), [5, 40, 5]).rotation.x = Math.PI / 2; // screen
        this.addMesh(new THREE.BoxGeometry(10, 30, 1), [30, 0, 0.5], 'grey'); // stage
        this.addMesh(new THREE.TetrahedronGeometry(5), [-40, -20, 5], 'grey').rotation.set(Math.PI / 5, Math.PI / 5, 0); // statue
        this.addMesh(new THREE.TetrahedronGeometry(5), [-40, -20, 5], 'grey').rotation.set(Math.PI * 1.2, Math.PI / 5, 0); // statue
        this.addMesh(new THREE.BoxGeometry(20, 100, 8), [60, 0, 4], 'burlywood'); // balcony
        // this.addMesh(new THREE.BoxGeometry(20, 100, 40), [80, 0, 20], 'burlywood'); // city hall
    }

    addMesh(geom, position, color) {
        const material = new THREE.MeshLambertMaterial({ color: color || 'dimgray', side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geom, material);
        if (position instanceof Array) {
            mesh.position.set(position[0], position[1], position[2]);
        } else {
            mesh.position.copy(position);
        }
        this.sceneManager.scene.add(mesh);
        return mesh;
    }

    applyGuiChanges() {
        this.width = this.columns * this.matWidth;
        this.height = this.rows * this.matHeight;

        this.sceneManager.scene.remove(this.lines);
        this.sceneManager.scene.add(this.lines = new THREE.LineSegments(new THREE.Geometry(), this.lineMaterial));
        for (var i = -this.columns / 2; i <= this.columns / 2; ++i) {
            this.lines.geometry.vertices.push(new THREE.Vector3(i * this.matWidth, this.height / 2, 0));
            this.lines.geometry.vertices.push(new THREE.Vector3(i * this.matWidth, -this.height / 2, 0));
        }
        for (var i = -this.rows / 2; i <= this.rows / 2; ++i) {
            this.lines.geometry.vertices.push(new THREE.Vector3(this.width / 2, i * this.matHeight, 0));
            this.lines.geometry.vertices.push(new THREE.Vector3(-this.width / 2, i * this.matHeight, 0));
        }

        this.sceneManager.scene.remove(this.plane);
        const geom = new THREE.PlaneGeometry(this.width, this.height);
        this.sceneManager.scene.add(this.plane = new THREE.Mesh(geom, this.imageMaterial));

        this.sceneManager.scene.remove(this.dot);
        this.dot = undefined;

    }

    onMouseMove(inter) {
        let e = document.getElementById('matLabel');
        if (this.dot) this.dot.visible = false;
        e.textContent = '----';
        inter = inter.filter(t => t.object === this.plane);
        if (inter.length === 0) return;

        const point = inter[0].point;
        const xmat = Math.ceil((point.x + this.width / 2) / this.matWidth);
        const ymat = Math.ceil((point.y + this.height / 2) / this.matHeight);
        e.textContent = '' + xmat + ', ' + ymat;

        const xpos = (xmat - 0.5) * this.matWidth - this.width / 2;
        const ypos = (ymat - 0.5) * this.matHeight - this.height / 2;
        if (!this.dot) {
            this.sceneManager.scene.add(this.dot = new THREE.Object3D());

            // create arrow
            const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0, 0.5, 8, 1, false), this.dotMaterial);
            cone.rotation.x = Math.PI / 2;
            cone.position.z = 0.25;
            const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.5, 8, 1, false), this.dotMaterial);
            cyl.rotation.x = Math.PI / 2;
            cyl.position.z = 0.75;
            this.dot.add(cone);
            this.dot.add(cyl);

            const path = new THREE.CurvePath();
            path.autoClose = true;
            const a = new THREE.Vector3(-this.matWidth / 2, -this.matHeight / 2);
            const b = new THREE.Vector3(this.matWidth / 2, -this.matHeight / 2);
            const c = new THREE.Vector3(this.matWidth / 2, this.matHeight / 2);
            const d = new THREE.Vector3(-this.matWidth / 2, this.matHeight / 2);
            path.add(new THREE.LineCurve3(a, b));
            path.add(new THREE.LineCurve3(c, b));
            path.add(new THREE.LineCurve3(c, d));
            path.add(new THREE.LineCurve3(d, a));
            path.add(new THREE.LineCurve3(a, b));
            const tube = new THREE.Mesh(new THREE.TubeGeometry(path, 350, 0.05, 8, true), this.dotMaterial);
            this.dot.add(tube);
        }
        this.dot.visible = true;
        this.dot.position.set(xpos, ypos, 0);
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
        this.addParam('rows', 65).name('Rows').min(2).max(100).step(1).onChange(this.applyGuiChanges);
        this.addParam('columns', 20).name('Columns').min(2).max(100).step(1).onChange(this.applyGuiChanges);
        this.addParam('matHeight', 0.61).name('Mat height').min(0.1).max(3.0).step(0.001).onChange(this.applyGuiChanges);
        this.addParam('matWidth', 1.73).name('Mat width').min(0.1).max(3.0).step(0.001).onChange(this.applyGuiChanges);
        // this.addParam('rotx', 0).min(-1).max(1).step(0.001).onChange(() => this.statue.rotation.x = this.rotx * Math.PI);
        // this.addParam('roty', 0).min(-1).max(1).step(0.001).onChange(() => this.statue.rotation.y = this.roty * Math.PI);
    }

    addParam(name, defaultValue, ...args) {
        this[name] = defaultValue;
        return this.gui.add.apply(this.gui, [this, name].concat(args));
    }
}
