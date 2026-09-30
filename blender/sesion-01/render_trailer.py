"""
Trailer Sesión 01 — Fundamentos IA Generativa (UIFCE · UNAL)
Estilo: Apple Keynote / Sci-Fi elegante
Uso headless:
  blender -b -P render_trailer.py -- --escena todas --engine EEVEE --preset rapido
  blender -b -P render_trailer.py -- --escena escena2 --engine CYCLES --preset final --fps 60 --res 1080p

Escenas:
  escena1 Evolución (nodos metálicos alta velocidad + motion blur)
  escena2 Cerebro/Harness (esfera cristal + núcleo partículas)
  escena3 Atención/Transformers (matrices cristal + rayos paralelos)
  escena4 Herramientas/MCP & RAG (hub central + módulos orbitando)
"""
import argparse
import math
import os
import random
import sys

import bpy
import mathutils

# --------------------------------------------------------------------------
# Args (después de --)
# --------------------------------------------------------------------------
def parse_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = []
    p = argparse.ArgumentParser()
    p.add_argument("--escena", default="todas",
                   choices=["todas", "escena1", "escena2", "escena3", "escena4"])
    p.add_argument("--engine", default="EEVEE", choices=["EEVEE", "CYCLES"])
    p.add_argument("--preset", default="rapido", choices=["rapido", "final"])
    p.add_argument("--fps", type=int, default=60)
    p.add_argument("--res", default="1080p", choices=["1080p", "720p", "4k"])
    p.add_argument("--outdir", default="//renders/sesion-01")
    p.add_argument("--transparent", action="store_true",
                   help="fondo transparente para capas traseras en Remotion")
    p.add_argument("--frames", type=int, default=0,
                   help="override nº frames por escena (0=auto 8s/10s/10s/10s + cierre)")
    return p.parse_args(argv)


ARGS = parse_args()
FPS = ARGS.fps
RES = {"720p": (1280, 720), "1080p": (1920, 1080), "4k": (3840, 2160)}[ARGS.res]
RAPIDO = ARGS.preset == "rapido"

# Duraciones a 60fps -> 45s totales aprox (8+10+10+10+7)
DURACIONES = {
    "escena1": int(8 * FPS),
    "escena2": int(10 * FPS),
    "escena3": int(10 * FPS),
    "escena4": int(10 * FPS),
    "cierre": int(7 * FPS),
}
if ARGS.frames > 0:
    for k in DURACIONES:
        DURACIONES[k] = ARGS.frames

random.seed(7)

# --------------------------------------------------------------------------
# Utilidades
# --------------------------------------------------------------------------
def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    # limpiar materiales / mallas huérfanas
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.curves):
        for x in list(coll):
            if x.users == 0:
                coll.remove(x)


def setup_render(engine="EEVEE"):
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = RES
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = ARGS.transparent
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    if engine == "CYCLES":
        scene.render.engine = "CYCLES"
        cyc = scene.cycles
        cyc.device = "GPU"
        cyc.samples = 32 if RAPIDO else 128
        cyc.use_motion_blur = True
        cyc.motion_blur_position = "CENTER"
    else:
        # Blender 4.x/5.x: EEVEE (en 5.2 el enum es BLENDER_EEVEE, NEXT no existe)
        for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
            try:
                scene.render.engine = eng
                break
            except TypeError:
                continue
        ee = scene.eevee
        if hasattr(ee, "taa_render_samples"):
            ee.taa_render_samples = 16 if RAPIDO else 64
        if hasattr(ee, "taa_samples"):
            ee.taa_samples = 8 if RAPIDO else 32
        # motion blur global (válido en 4.x/5.x para ambos motores)
        if hasattr(scene.render, "use_motion_blur"):
            scene.render.use_motion_blur = True
    scene.render.fps = FPS
    # color management cinematográfico
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = 0.0


def setup_world_keynote():
    world = bpy.context.scene.world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    # azul/gris metálico oscuro #060A14
    bg.inputs["Color"].default_value = (0.012, 0.02, 0.045, 1.0)
    bg.inputs["Strength"].default_value = 0.55
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    # niebla volumétrica tenue vía World Volume (solo Cycles; en EEVEE se simula con plano)
    return world


def make_mat_metal_oscuro(name="Keynote_Metal"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    n = mat.node_tree.nodes
    l = mat.node_tree.links
    n.clear()
    out = n.new("ShaderNodeOutputMaterial")
    princ = n.new("ShaderNodeBsdfPrincipled")
    princ.inputs["Base Color"].default_value = (0.08, 0.11, 0.16, 1.0)
    princ.inputs["Metallic"].default_value = 1.0
    princ.inputs["Roughness"].default_value = 0.28
    princ.inputs["Specular IOR Level"].default_value = 0.8
    l.new(princ.outputs["BSDF"], out.inputs["Surface"])
    return mat


def make_mat_cristal(name="Keynote_Glass"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    n = mat.node_tree.nodes
    l = mat.node_tree.links
    n.clear()
    out = n.new("ShaderNodeOutputMaterial")
    glass = n.new("ShaderNodeBsdfGlass")
    glass.inputs["Color"].default_value = (0.75, 0.88, 1.0, 1.0)
    glass.inputs["Roughness"].default_value = 0.05
    glass.inputs["IOR"].default_value = 1.45
    transp = n.new("ShaderNodeBsdfTransparent")
    mix = n.new("ShaderNodeMixShader")
    mix.inputs[0].default_value = 0.55
    l.new(transp.outputs["BSDF"], mix.inputs[1])
    l.new(glass.outputs["BSDF"], mix.inputs[2])
    l.new(mix.outputs["Shader"], out.inputs["Surface"])
    return mat


def make_mat_luz(color=(0.25, 0.6, 1.0, 1.0), strength=12.0, name="Keynote_Light"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    n = mat.node_tree.nodes
    l = mat.node_tree.links
    n.clear()
    out = n.new("ShaderNodeOutputMaterial")
    em = n.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = color
    em.inputs["Strength"].default_value = strength
    l.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def setup_luces_keynote():
    # Key spotlight con sombras suaves
    bpy.ops.object.light_add(type="SPOT", location=(6, -7, 8))
    key = bpy.context.active_object
    key.name = "Key_Spot"
    key.data.energy = 500 if RAPIDO else 2200
    key.data.spot_size = math.radians(42)
    key.data.shadow_soft_size = 0.6
    key.data.color = (0.82, 0.9, 1.0)
    # Rim azul
    bpy.ops.object.light_add(type="AREA", location=(-7, 5, 4))
    rim = bpy.context.active_object
    rim.name = "Rim_Blue"
    rim.data.energy = 200 if RAPIDO else 800
    rim.data.color = (0.25, 0.55, 1.0)
    rim.data.size = 4.0
    # Fill tenue
    bpy.ops.object.light_add(type="POINT", location=(0, 0, 6))
    fill = bpy.context.active_object
    fill.name = "Fill_Top"
    fill.data.energy = 60 if RAPIDO else 300
    fill.data.color = (0.7, 0.8, 1.0)
    return [key, rim, fill]


def iter_fcurves(obj):
    """Itera las F-Curves animadas de un objeto.

    Compatible con Blender ≤4.x (``action.fcurves``) y Blender 5.x
    (layered actions: ``layers → strips → channelbag``), donde
    ``Action`` ya no expone ``fcurves`` directamente.
    """
    ad = getattr(obj, "animation_data", None)
    if not ad or not ad.action:
        return
    act = ad.action
    if hasattr(act, "fcurves"):
        yield from act.fcurves
        return
    for layer in getattr(act, "layers", []) or []:
        for strip in getattr(layer, "strips", []) or []:
            bags = getattr(strip, "channelbags", None)
            if bags is not None:
                for cb in bags:
                    yield from cb.fcurves
                continue
            # Fallback: channelbag(slot) por slot (firma 5.x)
            for slot in getattr(act, "slots", []) or []:
                try:
                    yield from strip.channelbag(slot).fcurves
                except (AttributeError, TypeError, RuntimeError):
                    continue


def set_bezier(obj, frame=None):
    """Easing Bezier suave en los keyframes del objeto.

    Si ``frame`` se indica, solo afecta keyframes cercanos a ese frame.
    """
    for fc in iter_fcurves(obj):
        for kp in fc.keyframe_points:
            if frame is None or abs(kp.co.x - frame) < 0.5:
                kp.interpolation = "BEZIER"
                kp.handle_left_type = "AUTO_CLAMPED"
                kp.handle_right_type = "AUTO_CLAMPED"


def ease_bezier(obj, frame, loc=None, rot=None, scale=None):
    if loc is not None:
        obj.location = loc
        obj.keyframe_insert(data_path="location", frame=frame)
    if rot is not None:
        obj.rotation_euler = rot
        obj.keyframe_insert(data_path="rotation_euler", frame=frame)
    if scale is not None:
        obj.scale = scale
        obj.keyframe_insert(data_path="scale", frame=frame)
    # easing suave en fcurves nuevas
    set_bezier(obj, frame)


def make_camera_rig(name="KeynoteCam", loc=(7.5, -9, 4.2)):
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.active_object
    cam.name = name
    cam.data.lens = 42
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = 11.0
    cam.data.dof.aperture_fstop = 2.8
    bpy.context.scene.camera = cam
    # target vacío para orbitar
    bpy.ops.object.empty_add(location=(0, 0, 1.0))
    target = bpy.context.active_object
    target.name = f"{name}_Target"
    tr = cam.constraints.new("TRACK_TO")
    tr.target = target
    tr.track_axis = "TRACK_NEGATIVE_Z"
    tr.up_axis = "UP_Y"
    return cam, target


def orbit_camera(cam, target, f_start, f_end, radius=11.0, z=4.2,
                 angle_start=-0.6, angle_end=0.7, push_in=2.0):
    """Órbita + push-in rápido con easing Bezier."""
    for i, f in enumerate((f_start, f_end)):
        t = i  # 0 inicio, 1 fin
        ang = angle_start + (angle_end - angle_start) * t
        r = radius - push_in * t
        loc = (r * math.cos(ang), r * math.sin(ang) * -1.6, z - 0.8 * t)
        bpy.context.scene.frame_set(f)
        cam.location = loc
        cam.keyframe_insert(data_path="location", frame=f)
    # Foco anclado al centro de la órbita: el push-in nunca desenfoca al sujeto.
    try:
        cam.data.dof.focus_object = target
    except (AttributeError, TypeError):
        pass
    set_bezier(cam)


# --------------------------------------------------------------------------
# ESCENAS
# --------------------------------------------------------------------------
def escena1_evolucion(f_start=1):
    """Cadena de nodos metálicos a alta velocidad (tarjetas->transistores->transformers)."""
    n_frames = DURACIONES["escena1"]
    f_end = f_start + n_frames
    mat_metal = make_mat_metal_oscuro()
    mat_luz = make_mat_luz((0.3, 0.75, 1.0, 1.0), 6.0, "Evo_Light")
    nodos = []
    for i in range(26):
        x = -14 + i * 1.15
        bpy.ops.mesh.primitive_cube_add(size=0.55, location=(x, random.uniform(-0.4, 0.4), 1.0))
        c = bpy.context.active_object
        c.name = f"Evo_Nodo_{i:02d}"
        c.data.materials.append(mat_metal if i % 4 else mat_luz)
        # variación escala para ritmo
        c.scale = (1.0, 1.0, 0.25 + (i % 5) * 0.22)
        c.keyframe_insert(data_path="scale", frame=f_start)
        nodos.append(c)
    # barrido: todo el grupo pasa frente a cámara (movemos un empty padre)
    bpy.ops.object.empty_add(location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = "Evo_Root"
    for n in nodos:
        n.parent = root
    bpy.context.scene.frame_set(f_start)
    root.location.x = -9.0
    root.keyframe_insert(data_path="location", frame=f_start)
    bpy.context.scene.frame_set(f_end)
    root.location.x = 9.5
    root.keyframe_insert(data_path="location", frame=f_end)
    set_bezier(root)
    cam, tgt = make_camera_rig("Cam_Evo", loc=(0, -8.5, 2.6))
    tgt.location = (0, 0, 1.0)
    orbit_camera(cam, tgt, f_start, f_end, radius=8.5, z=2.8,
                 angle_start=-0.25, angle_end=0.25, push_in=2.4)
    return f_start, f_end, cam


def escena2_cerebro(f_start=1):
    """Esfera de cristal + núcleo de partículas vibrando (Harness/ Agente)."""
    n_frames = DURACIONES["escena2"]
    f_end = f_start + n_frames
    mat_glass = make_mat_cristal()
    mat_core = make_mat_luz((0.45, 0.8, 1.0, 1.0), 1.5, "Core_Light")
    mat_part = make_mat_luz((0.45, 0.8, 1.0, 1.0), 1.5, "Particula_Light")
    # esfera cristal
    bpy.ops.mesh.primitive_uv_sphere_add(radius=2.0, location=(0, 0, 1.6))
    esfera = bpy.context.active_object
    esfera.name = "Harness_Esfera"
    esfera.data.materials.append(mat_glass)
    # núcleo icosfera emisiva (pequeño: el brillo sale del bloom, no del tamaño)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.45, location=(0, 0, 1.6))
    core = bpy.context.active_object
    core.name = "Agente_Core"
    core.data.materials.append(mat_core)
    # partículas: 120 icosferas pequeñas orbitando (instanciado simple)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.05, location=(0, 0, 0))
    base = bpy.context.active_object
    base.name = "Particula_Base"
    base.data.materials.append(mat_part)
    base.hide_render = True
    base.hide_viewport = True
    for i in range(110 if RAPIDO else 220):
        o = base.copy()
        o.data = base.data.copy()
        bpy.context.collection.objects.link(o)
        o.hide_render = False
        o.hide_viewport = False
        r = random.uniform(1.1, 2.6)
        th = random.uniform(0, math.pi * 2)
        ph = random.uniform(-1.0, 1.0)
        o.location = (r * math.cos(th), r * math.sin(th), 1.6 + ph)
        # animación vibración/orbita vía 2 keyframes + NOISE modifier
        bpy.context.scene.frame_set(f_start)
        o.keyframe_insert(data_path="location", frame=f_start)
        bpy.context.scene.frame_set(f_end)
        o.rotation_euler = (0, 0, th + 2.2)
        o.location = (r * math.cos(th + 1.1), r * math.sin(th + 1.1), 1.6 - ph)
        o.keyframe_insert(data_path="location", frame=f_end)
        o.keyframe_insert(data_path="rotation_euler", frame=f_end)
    # pulso del core
    for f in (f_start, f_start + n_frames // 2, f_end):
        bpy.context.scene.frame_set(f)
        s = 1.0 if f != f_start + n_frames // 2 else 1.35
        core.scale = (s, s, s)
        core.keyframe_insert(data_path="scale", frame=f)
    cam, tgt = make_camera_rig("Cam_Cerebro", loc=(6.5, -7.5, 3.4))
    tgt.location = (0, 0, 1.6)
    orbit_camera(cam, tgt, f_start, f_end, radius=11.0, z=3.6,
                 angle_start=-0.7, angle_end=0.9, push_in=2.0)
    return f_start, f_end, cam


def escena3_atencion(f_start=1):
    """Matrices flotantes cristal + rayos paralelos (Attention)."""
    n_frames = DURACIONES["escena3"]
    f_end = f_start + n_frames
    mat_glass = make_mat_cristal("Att_Glass")
    mat_ray = make_mat_luz((0.5, 0.85, 1.0, 1.0), 4.0, "Att_Ray")
    nodos_q, nodos_k = [], []
    for row in range(4):
        for col in range(6 if RAPIDO else 8):
            for lado, lista in (("Q", nodos_q), ("K", nodos_k)):
                x = col * 1.6 - 5.0
                y = -3.2 if lado == "Q" else 3.2
                z = 0.6 + row * 1.1 + random.uniform(-0.1, 0.1)
                bpy.ops.mesh.primitive_cube_add(size=0.5, location=(x, y, z))
                c = bpy.context.active_object
                c.name = f"Att_{lado}_{row}_{col}"
                c.data.materials.append(mat_glass)
                lista.append(c)
    # rayos: curvas Bezier Q->K (subset para rendimiento)
    step = 2 if RAPIDO else 1
    for q in nodos_q[::step * 2]:
        k = random.choice(nodos_k)
        bpy.ops.curve.primitive_bezier_curve_add()
        cur = bpy.context.active_object
        cur.name = f"Ray_{q.name}"
        spl = cur.data.splines[0]
        spl.bezier_points[0].co = q.location
        spl.bezier_points[1].co = k.location
        cur.data.bevel_depth = 0.02
        cur.data.materials.append(mat_ray)
        # animar bevel_factor para "encendido" en paralelo
        cur.data.bevel_factor_start = 0.0
        cur.data.bevel_factor_end = 0.0
        cur.data.keyframe_insert(data_path="bevel_factor_end", frame=f_start + 10)
        cur.data.bevel_factor_end = 1.0
        cur.data.keyframe_insert(data_path="bevel_factor_end",
                                 frame=f_start + int(n_frames * 0.6))
    # flotación matrices
    for lst in (nodos_q, nodos_k):
        for o in lst:
            bpy.context.scene.frame_set(f_start)
            o.keyframe_insert(data_path="location", frame=f_start)
            bpy.context.scene.frame_set(f_end)
            o.location.z += 0.55
            o.keyframe_insert(data_path="location", frame=f_end)
    cam, tgt = make_camera_rig("Cam_Att", loc=(0, -10.5, 5.2))
    tgt.location = (0, 0, 2.0)
    orbit_camera(cam, tgt, f_start, f_end, radius=11.0, z=5.2,
                 angle_start=-0.5, angle_end=0.5, push_in=3.0)
    return f_start, f_end, cam


def escena4_hub(f_start=1):
    """Hub central + módulos orbitando (MCP & RAG)."""
    n_frames = DURACIONES["escena4"]
    f_end = f_start + n_frames
    mat_metal = make_mat_metal_oscuro("Hub_Metal")
    mat_mod = make_mat_luz((0.35, 0.7, 1.0, 1.0), 3.5, "Hub_Mod")
    # hub: toro + cilindro
    bpy.ops.mesh.primitive_torus_add(major_radius=1.2, minor_radius=0.28,
                                     location=(0, 0, 1.6))
    hub = bpy.context.active_object
    hub.name = "Hub_Central"
    hub.data.materials.append(mat_metal)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=0.7, location=(0, 0, 1.6))
    core = bpy.context.active_object
    core.name = "Hub_Core"
    core.data.materials.append(mat_mod)
    hub.rotation_euler = (0, 0, 0)
    hub.keyframe_insert(data_path="rotation_euler", frame=f_start)
    hub.rotation_euler = (0, 0, math.radians(180))
    hub.keyframe_insert(data_path="rotation_euler", frame=f_end)
    # módulos orbitando
    mods = []
    for i in range(7):
        ang = (math.pi * 2 / 7) * i
        bpy.ops.mesh.primitive_cube_add(size=0.55,
                                        location=(3.4 * math.cos(ang),
                                                  3.4 * math.sin(ang), 1.6))
        m = bpy.context.active_object
        m.name = f"Modulo_{i:02d}"
        m.data.materials.append(mat_mod if i % 2 == 0 else mat_metal)
        mods.append((m, ang))
    for f in (f_start, f_end):
        bpy.context.scene.frame_set(f)
        t = 0 if f == f_start else 1.4
        for m, ang in mods:
            a = ang + t
            m.location = (3.4 * math.cos(a), 3.4 * math.sin(a),
                          1.6 + 0.5 * math.sin(a * 2))
            m.keyframe_insert(data_path="location", frame=f)
            m.rotation_euler = (0, 0, a)
            m.keyframe_insert(data_path="rotation_euler", frame=f)
    cam, tgt = make_camera_rig("Cam_Hub", loc=(7.0, -7.0, 4.6))
    tgt.location = (0, 0, 1.6)
    orbit_camera(cam, tgt, f_start, f_end, radius=10.0, z=4.6,
                 angle_start=-0.9, angle_end=0.9, push_in=2.0)
    return f_start, f_end, cam


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
def ensamblar_mp4(png_pattern, mp4_path, fps):
    """Une una secuencia PNG en MP4 H.264 via ffmpeg.

    Blender 5.x ya no expone salida directa a video por Python
    (``is_movie_format`` es de solo lectura), así que siempre se
    renderiza secuencia de imágenes y se ensambla aquí.
    """
    import shutil
    import subprocess
    ff = shutil.which("ffmpeg")
    if not ff:
        print("[WARN] ffmpeg no encontrado: se conserva solo la secuencia PNG")
        return None
    cmd = [ff, "-y", "-framerate", str(fps), "-i", png_pattern,
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
           mp4_path]
    print("[ffmpeg]", " ".join(cmd))
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("[WARN] ffmpeg falló:\n" + r.stderr[-2000:])
        return None
    return mp4_path


def render_escena(nombre, builder, idx):
    print(f"\n===== {nombre} =====")
    clear_scene()
    setup_world_keynote()
    setup_luces_keynote()
    f0 = 1
    f0, f1, cam = builder(f0)
    scene = bpy.context.scene
    scene.frame_start = f0
    scene.frame_end = f1
    if ARGS.outdir.startswith("//"):
        # Sin .blend guardado, `//` no es fiable: resolver contra el CWD.
        outdir = os.path.abspath(os.path.join(os.getcwd(), ARGS.outdir[2:]))
    else:
        outdir = bpy.path.abspath(ARGS.outdir)
    os.makedirs(outdir, exist_ok=True)
    # Siempre secuencia PNG (a prueba de versiones); el MP4 se ensambla con ffmpeg.
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = os.path.join(outdir, f"{nombre}_####.png")
    bpy.ops.render.render(animation=True)
    png_pattern = os.path.join(outdir, f"{nombre}_%04d.png")
    if ARGS.transparent:
        print(f"[OK] {nombre}: {f0}-{f1} -> {png_pattern} (con alfa)")
    else:
        mp4 = os.path.join(outdir, f"{nombre}.mp4")
        out = ensamblar_mp4(png_pattern, mp4, FPS)
        print(f"[OK] {nombre}: {f0}-{f1} -> {out or png_pattern}")


def main():
    setup_render(ARGS.engine)
    orden = []
    if ARGS.escena in ("todas", "escena1"):
        orden.append(("escena1_evolucion", escena1_evolucion, 1))
    if ARGS.escena in ("todas", "escena2"):
        orden.append(("escena2_cerebro", escena2_cerebro, 2))
    if ARGS.escena in ("todas", "escena3"):
        orden.append(("escena3_atencion", escena3_atencion, 3))
    if ARGS.escena in ("todas", "escena4"):
        orden.append(("escena4_hub", escena4_hub, 4))
    for nombre, builder, idx in orden:
        render_escena(nombre, builder, idx)


if __name__ == "__main__":
    main()
