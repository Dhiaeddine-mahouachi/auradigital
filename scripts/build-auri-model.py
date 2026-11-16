"""Build Auri's editable mesh hierarchy and web assets with Blender."""
import math
import bpy
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def material(name, color, roughness, metal=0, emission=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metal
    bsdf.inputs['Emission Color'].default_value = (*color, 1)
    bsdf.inputs['Emission Strength'].default_value = emission
    return mat

ivory = material('Ivory ceramic', (.88, .87, .81), .32, .12)
graphite = material('Graphite polymer', (.035, .041, .048), .38, .16)
glass = material('Black glass', (.008, .010, .012), .22, .08)
trim = material('Brushed titanium', (.22, .24, .25), .31, .53)
light = material('Acid yellow', (.8, .8, .004), .32, .08, .75)
hologram = material('Holographic gold', (.42, .56, .018), .32, .25, .3)

def group(name, at=(0, 0, 0), parent=None):
    obj = bpy.data.objects.new(name, None)
    scene.collection.objects.link(obj)
    obj.parent, obj.location = parent, at
    return obj

def finish(name, at, mat, parent):
    obj = bpy.context.object
    obj.name, obj.parent, obj.location = name, parent, at
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

def oval(name, at, size, mat, parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=16)
    obj = finish(name, at, mat, parent)
    obj.scale = size
    return obj

def shell(name, at, size, radius, mat, parent):
    bpy.ops.mesh.primitive_cube_add()
    obj = finish(name, at, mat, parent)
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = obj.modifiers.new('Rounded edges', 'BEVEL')
    mod.width, mod.segments = radius, 7
    normal = obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    normal.keep_sharp = True
    return obj

def line(name, start, end, width, mat, parent):
    a, b = Vector(start), Vector(end)
    obj = oval(name, (a + b) / 2, (width, width, (b-a).length/2+width), mat, parent)
    obj.rotation_euler = (b-a).to_track_quat('Z', 'Y').to_euler()
    return obj

root = group('Auri')
head = group('Head', (0, 0, 1.62), root)
shell('Helmet', (0, 0, 0), (1.54, 1.05, 1.12), .49, ivory, head)
shell('Faceplate gasket', (0, -.25, .014), (1.37, .73, .87), .35, graphite, head)
shell('Faceplate', (0, -.337, .015), (1.32, .72, .827), .346, glass, head)
eyes = group('Eyes', (0, -.702, .045), head)
for side in (-1, 1):
    oval(f'Eye {side}', (side*.225, 0, 0), (.068, .022, .124), light, eyes)
    oval(f'Ear {side}', (side*.755, .015, 0), (.12, .25, .26), graphite, head)
    oval(f'Ear light {side}', (side*.843, .015, 0), (.047, .185, .192), light, head)
    oval(f'Ear inset {side}', (side*.864, .015, 0), (.036, .155, .163), trim, head)
antenna = group('Antenna', (.40, .035, .47), head)
line('Antenna stem', (0,0,0), (.12,0,.29), .024, trim, antenna)
oval('Antenna tip', (.12,0,.307), (.058,.058,.059), light, antenna)

body = group('Torso', (0, 0, .86), root)
oval('Torso shell', (0, .03, -.07), (.49, .34, .47), graphite, body)
oval('Rear shell', (0, .127, -.045), (.47, .27, .405), ivory, body)
oval('Neck', (0, 0, .315), (.25, .225, .18), trim, body)
for side in (-1, 1):
    line(f'Emblem {side}', (0,-.314,.015), (side*.083,-.300,-.10), .018, light, body)

arms = group('Arms', (0,0,0), root)
feet = group('Feet', (0,0,0), root)
legs = group('Legs', (0,0,0), feet)
for side, name in [(-1,'Left'),(1,'Right')]:
    arm = group(f'{name}Arm', (side*.40, .015, 1.06), arms)
    oval('Shoulder '+name, (0,0,0), (.17,.176,.17), trim, arm)
    line('Arm shell '+name, (0,0,-.02), (side*.19,-.025,-.32), .119, ivory, arm)
    hand = group(name+'Hand', (side*.21,-.032,-.405), arm)
    oval('Palm '+name, (0,0,0), (.115,.12,.135), graphite, hand)
    oval('Thumb '+name, (-side*.10,-.052,.014), (.055,.07,.078), graphite, hand)
    oval('Knee '+name, (side*.238,.018,.39), (.124,.12,.18), trim, legs)
    oval('Boot '+name, (side*.238,-.074,.185), (.159,.222,.135), graphite, feet)
    oval('Toe panel '+name, (side*.238,-.137,.232), (.132,.154,.075), ivory, feet)

builder = group('BuilderKit', (0,0,0), root)
oval('Builder chest plate', (0,-.195,.665), (.335,.147,.278), ivory, builder)
oval('Socket', (0,-.335,.701), (.109,.021,.086), graphite, builder)
oval('Socket light', (0,-.359,.701), (.051,.012,.019), light, builder)
operator = group('OperatorKit', (0,0,0), root)
shell('Battery pack', (0,.318,.785), (.71,.26,.579), .115, graphite, operator)
for side in (-1,1):
    oval(f'Pack light {side}', (side*.325,.355,.86), (.035,.099,.129), light, operator)
strategist = group('StrategistKit', (0,0,0), root)
shell('Planning display', (.62,-.48,.75), (.57,.065,.34), .028, hologram, strategist)
for i, height in enumerate([.045,.085,.126]):
    shell(f'Chart bar {i}', (.49+i*.13,-.524,.659+height/2), (.047,.013,height), .005, light, strategist)
master = group('MasterKit', (0,0,0), root)
for side in (-1,1):
    for i in range(3):
        line(f'Wing {side} {i}', (side*.32,.268,.76+i*.14), (side*(.73+i*.10),.32,.83+i*.27), .095, hologram, master)
oval('Hover core', (0,.014,.433), (.23,.235,.125), light, master)

bpy.ops.export_scene.gltf(filepath='media/auri/auri.glb', export_format='GLB', export_apply=True)

# Bake compact transparent posters for devices that cannot run WebGL.
def point(obj, target):
    obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

bpy.ops.object.camera_add(location=(2.7,-8.0,3.02))
camera=bpy.context.object
camera.data.type, camera.data.ortho_scale='ORTHO', 2.65
scene.camera=camera
scene.world=bpy.data.worlds.new('Studio')
scene.world.color=(.23,.23,.23)
for pos,energy,color,size in [
    ((-3,-4,5),420,(1,.94,.83),3.3), ((3,-2,3),170,(.80,.89,1),2.8),
    ((1,3,4),280,(1,.95,.56),2.2),
]:
    bpy.ops.object.light_add(type='AREA', location=pos)
    lamp=bpy.context.object
    lamp.data.energy, lamp.data.color, lamp.data.shape, lamp.data.size=energy,color,'DISK',size
    point(lamp,(0,0,1.2))
scene.render.engine='CYCLES'
scene.cycles.samples=28
scene.cycles.use_denoising=False
scene.render.resolution_x=scene.render.resolution_y=256
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG'

def hide(obj, hidden):
    for node in obj.children_recursive:
        node.hide_render=hidden

for level in range(1,8):
    for obj, visible in [(body, level>=2),(feet, 2<=level<7),(legs,3<=level<7),
                         (arms,level>=3),(antenna,level==2),(builder,level>=4),
                         (operator,level>=5),(strategist,level==6),(master,level==7)]:
        hide(obj, not visible)
    if level==2:
        hide(legs,True)
    point(camera,(0,0,1.61 if level==1 else 1.14))
    camera.data.ortho_scale=1.95 if level==1 else 2.65
    scene.render.filepath=f'/tmp/auri-level-{level}.png'
    bpy.ops.render.render(write_still=True)
