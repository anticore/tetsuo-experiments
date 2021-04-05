let assets;

function init() {
    TETSUO.Utils.prepareViewport({
        width: 1280,
        height: 800,
    });

    TETSUO.Utils.createStartButton(
        () => {
            new TETSUO.Preloader().loadManifest("manifest.json", (loaded) => {
                assets = loaded;
                setup();
            });
        },
        {
            label: "mafamood",
            sublabel:
                "released @ revision 2021 - code by anticore - music by jeenio",
        }
    );
}

function setup() {
    let bootstrap = new TETSUO.Bootstrap({
        dev: true,
        autoStart: true,
    });

    let syncer = new TETSUO.Syncer(assets.music, { bpm: 110 });

    let text = new TETSUO.PIXINode({});

    let texts = [];

    function writeText(str, x, y, clear) {
        if (clear) {
            texts.forEach((t) => text.remove(t));
        }

        y = -y;

        let t = new PIXI.Text(str, {
            fontFamily: "Georgia",
            fontSize: 50,
            fill: 0xffffff,
        });

        t.position.x = ((x + 1) / 2) * 1280;
        t.position.y = ((y + 1) / 2) * 800;

        text.add(t);
        texts.push(t);
    }

    let t = -0.8;
    writeText("alien", -0.9, t);
    writeText("crmx", -0.4, t);
    writeText("jae686", 0.1, t);
    writeText("lordcoxis", 0.6, t);
    t = -0.6;
    writeText("ps", -0.7, t);
    writeText("dextrose", -0.35, t);
    writeText("gr9yfox", 0.2, t);
    writeText("rup", 0.7, t);
    t = -0.4;
    writeText("xernobyl", -0.95, t);
    writeText("EviL", -0.45, t);
    writeText("PauloFalcao", -0.05, t);
    writeText("zeroshift", 0.65, t);

    let shader = new TETSUO.ShaderNode({
        noUpdateTime: true,

        fragmentShader: /*glsl*/ `
            uniform float time;
            const vec2 resolution = vec2(1280., 800.);
            uniform sampler2D tex1;

            float mv;
            float screenOn = 0.;
            int scene = 0;
    
            vec3 rep(vec3 p,vec3 c){return mod(p+.5*c,c)-.5*c;}
            mat2 rot(float a){return mat2(cos(a),sin(a),-sin(a),cos(a));}
            float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
            float sdPlane(vec3 p,vec3 n,float h){return dot(p,n)+h;}
            vec3 fog(vec3 c,vec3 fc,float ff,float d){return mix(c,fc,1.-exp(-d*ff));}
            vec3 rnd23(vec2 p){vec3 p3=fract(p.xyx*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yxz+313.33);return fract((p3.xxy+p3.yzz)*p3.zyx);}
            vec3 rnd33(vec3 p3){p3=fract(p3*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yxz+313.33);return fract((p3.xxy+p3.yxx)*p3.zyx);}
            vec2 voronoi(vec2 x,float d){vec2 n=floor(x);vec2 f=fract(x);vec3 m=vec3(8.);
                for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=rnd23(n+g).xy;vec2 r=g-f+(.5+.5*sin(6.2831+d*o));float d=dot(r,r);if(d<m.x)m=vec3(d,o);}
                return vec2(sqrt(m.x),m.y+m.z);
            }
    
            float cubeSpiral(vec3 p) {
                p += vec3(-5., sin(time + p.x * .1) * 2., cos(time + p.x * .1) * 2.);
                p = rep(p, vec3(10., 0., 0.));
                p.yz *= rot(time);
                p.xz *= rot(time);
                return sdBox(p, vec3(.5)) - .2;
            }
    
            float glassCubes(vec3 p) {
                float d = 999.;
                p.x += -mv;
                p.xz *= rot(time / 2.);
                p.yx *= rot(time / 3.);
                
                float xi = scene == 7 ? .3 : .5;
                float yi = scene == 7 ? .1 : .4;
                int ni = scene == 7 ? 12 : 8;

                for (int i = 0; i < ni; i++) {
                    float fi = float(i);
                    d = min(
                        d,
                        sdBox(
                            p + vec3(sin(fi + time * 0.2), cos(fi + time * 0.3), sin(fi * 0.4 + time * 0.4)), 
                            vec3(
                                xi + fi * 0.01 + sin(time * 7.) * 0.01,
                                yi + fi * 0.01 + sin(time * 2.) * 0.01,
                    
                                xi + fi * 0.01 + sin(time) * 0.02
                            )
                        )
                    );
                }
    
                return d;
            }
    
            vec2 map(vec3 p) {
                float w = 7., h = 6.;
                
                vec3 pp = p;
                if (scene == 5) pp.yz *= rot(sin(p.x / 20. + time));
                float ground = min(sdPlane(pp, vec3(0., 1., 0.), h), sdPlane(pp, vec3(0., -1., 0.), h));
                float wall = min(sdPlane(pp, vec3(0., 0., -1.), w), sdPlane(pp, vec3(0., 0., 1.), w));
                float cubes = cubeSpiral(p);
                float cubes2 = glassCubes(p);
    
                float m = 999.;
                float mm = 0.;
    
                if (ground < m) {
                     m = ground;
                }
                if (wall < m) {
                    m = wall;
                    mm = 1.;
                }

                if (scene > 1 && scene < 5 || scene == 7) {
                    if (cubes2 < m) {
                        m = cubes2;
                         mm = 2.;
                    }   
                }

                if (scene == 5 || scene == 6 || scene == 8) {
                    if (cubes < m) {
                        m = cubes;
                         mm = 3.;
                    }
                }
    
                return vec2(m, mm);
            }
            vec3 norm(vec3 p) {
                float E = 0.003; vec2 k = vec2(1., -1.);
                return normalize(
                    k.xyy * map(p + k.xyy * E).x + 
                    k.yyx * map(p + k.yyx * E).x + 
                    k.yxy * map(p + k.yxy * E).x + 
                    k.xxx * map(p + k.xxx * E).x
                );
            }
            float ao(vec3 p,vec3 n,float d){return clamp(map(p+n*d).x/d,0.,1.);}
    
            vec4 mat(float id, vec3 p, vec3 n, vec2 uv, float td) {
                vec3 c;
                float ns, on;
                float oc = ao(p, n, 1.);
                float tt = scene == 0 || scene == 10 ? 15. : time;
    
                if (id == 0.) {
                    vec2 vor = voronoi(p.xz / 1.3, 0.);
                    ns = vor.y  * 1.;
                    on = step(.1 + fract(abs(sin(tt * 1.2)) * 0.1), screenOn - ns);
                    c = vec3(sin(ns * tt), cos(ns * tt), sin(ns * tt * 3.)) * on;
                    //c = vec3(fract(time));  
                } 
                    
                else if (id == 1.) {
                    bool cond = scene == 3 || scene == 6 || scene == 9;
                    vec2 pp = !cond ? p.xy / 1.3 : p.xy * (scene == 3 ? 8. : 10.);
                    float timemul = cond ? time * 5. : time;
                    tt = scene < 1 || scene > 9 ? 15. : timemul;

                    vec2 vor = voronoi(pp, 0.);
                    ns = vor.y * 1.;
                    if (scene == 6) on = round(texture2D(tex1, vec2(p.x * 0.01, -0.775 + p.y * 0.025)).a);
                    else if (scene == 9) on = round(texture2D(tex1, vec2(-0.1 + p.x * 0.008, -0.79 + p.y * 0.015)).a);
                    else on = step(.1 + fract(abs(sin(tt * 1.1)) * 0.06), screenOn - ns);
                    c = vec3(sin(ns * tt * 1.2),cos(ns * tt * 1.3),sin(ns * tt * 1.5)) * on;
                }
                
                else if (id == 2. || id == 3.) {
                    c = vec3(0.1);
                }
                
                return vec4(fog(c * oc, vec3(.0), 0.016, td), on);
            }
                
            vec4 tr(vec3 ro, vec3 rd, vec2 uv) {
                float td = 1.;
                vec2 h;
                
                vec4 c = vec4(0.);
                int bnc = 0;
                float en = 1.;
                
                for (int i = 0; i < 200; i++) {
                    vec3 ip = ro + rd * td;
                    
                    h = map(ip);
                    td += h.x;
                    
                    if (h.x < 0.01) {
                        vec3 inorm = norm(ip);
                        vec4 m = mat(h.y, ip, inorm, uv, td);
                        
                        if (h.y == 0. || h.y == 1.) {
                            c += m * en;
                            ro = ip;
                            rd = reflect(rd, inorm);
                            td = .2;
                            bnc += 1; 
                            en = max(en - .8, 0.);
                        }
                        if (h.y == 2. || h.y == 3.) {
                            vec3 sc = rnd33(ip*100.);
                            c += (m + vec4(sc*0.13 * 0.4,0.) ) * en;
                            ro = ip;
                            rd = reflect(rd, inorm) +   (sc- 0.5) * 0.13;
                            td = .2;
                            bnc += 1;
                            en = max(en - .4, 0.);
                        }
                    }
                    
                    if (bnc > 3 || en == 0.) return c;
                    
                    if (td > 500.) break;
                }
                
                return c;
            }
    
            vec3 cam(vec3 ro, vec3 tar, vec2 uv) {
                vec3 f = normalize(tar-ro);
                vec3 l = normalize(cross(vec3(0.,1.,0.),f));
                vec3 u = normalize(cross(f,l));
                return normalize(f+l*uv.x + u*uv.y);
            }
    
            void main() {
                vec2 uv = (gl_FragCoord.xy / resolution - 0.5) / vec2(resolution.y / resolution.x, 1.);
                
                if (time > 0.) screenOn = .2;
                if (time > 2.) screenOn = .25;
                if (time > 3.5) screenOn = .3;
                if (time > 5.) screenOn = .4;
                if (time > 6.5) screenOn = .45;
                if (time > 8.) screenOn = .5;
                if (time > 10.) screenOn = .6;
                if (time > 11.5) screenOn = .65;
                if (time > 13.) screenOn = .7;
                if (time > 14.5) screenOn = .8;
                if (time > 16.) screenOn = 1.;
                if (time > 244.) screenOn = 0.7;
                if (time > 245.5) screenOn = 0.55;
                if (time > 247.) screenOn = 0.4;
                if (time > 248.5) screenOn = 0.3;
                if (time > 250.) screenOn = 0.2;
                if (time > 252.) screenOn = 0.;
                
                        
                mv = time * 3.;
                vec3 ro;
                vec3 tar;

                if (time > 0.) {
                    ro = vec3(mv - 5., 0., 0.);
                    tar = vec3(1. + mv, 0., 0.);
                    scene = 0;
                }
                if (time > 16.) {
                    ro = vec3(mv - 5., -1., 0.);
                    tar = vec3(1. + mv, -2., 10.);
                    scene = 1;
                } 
                if (time > 32.) {
                    ro = vec3(mv - 5., 0., 0.);
                    tar = vec3(1. + mv, 0., 0.);
                    scene = 2;
                } 
                if (time > 64.) {
                    ro = vec3(mv - 2., 0., -5.);
                    tar = vec3(2. + mv, 0., 7.);
                    scene = 3;
                } 
                if (time > 96.) {
                    ro = vec3(mv - 5. * sin(time / 1.8), cos(time), 5. * cos(time / 1.8));
                    tar = vec3(mv, 0., 0.);
                    scene = 4;
                } 
                if (time > 128.) {
                    ro = vec3(mv - 5., 0., 0.);
                    tar = vec3(1. + mv, 0., 0.);
                    scene = 5;
                }
                if (time > 144.) {
                    ro = vec3(mv - 2., 0., -5.);
                    tar = vec3(2. + mv, 0., 7.);
                    scene = 6;
                }
                if (time > 176.) {
                    ro = vec3(mv - 5. * sin(time / 1.8), cos(time), 5. * cos(time / 1.8));
                    tar = vec3(mv, 0., 0.); 
                    scene = 7;
                }
                if (time > 208.) {
                    ro = vec3(mv + 5., 0., 0.);
                    tar = vec3(1. + mv, 0., 0.);
                    scene = 8;
                } 
                if (time > 224.) {
                    ro = vec3(mv - 2., 0., -5.);
                    tar = vec3(2. + mv, 0., 7.);
                    scene = 9;
                } 
                if (time > 240.) {
                    ro = vec3(mv - 5., 0., 0.);
                    tar = vec3(1. + mv, 0., 0.);
                    scene = 10;
                }
                
                vec3 rd = cam(ro, tar, uv);

                vec4 t = tr(ro, rd, uv);
    
                gl_FragColor = pow(t, vec4(1./1.8));
          }
            //---------------------------------
        `,
    });

    shader.addInput(text, "tex1");

    let bpmDiv = document.querySelector("#debug-bpm");
    syncer.onUpdate((currBeat) => {
        //currBeat += 224;
        bpmDiv.textContent = Math.round(currBeat * 100) / 100;
        shader.uniforms["time"].value = currBeat;

        if (currBeat > 224) writeText("mafamood", -0.2, -0.5, true);
    });
    shader.onUpdate(() => syncer.update());

    bootstrap.connectToScreen(shader);
    syncer.play();
}

init();
