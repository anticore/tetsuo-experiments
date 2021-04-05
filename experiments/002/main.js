let assets;

function init() {
    TETSUO.Utils.prepareViewport({
        width: 1280,
        height: 800,
    });

    /*
    TETSUO.Utils.createStartButton(
        () => {
            new TETSUO.Preloader().loadManifest("manifest.json", (loaded) => {
                assets = loaded;
                setup();
            });
        }
    );
    */

    setup();
}

function setup() {
    let bootstrap = new TETSUO.Bootstrap({
        dev: true,
        autoStart: true,
    });

    //
}

init();
