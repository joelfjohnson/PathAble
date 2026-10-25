"""Original PathAble product scene. Run with Blender --background --python this_file -- [--final]."""
import bpy, math, os, sys
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FINAL='--final' in sys.argv
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=16 if FINAL else 8
scene.cycles.use_denoising=True
# Prefer the local Metal GPU; preserve CPU compatibility on other systems.
try:
 prefs=bpy.context.preferences.addons['cycles'].preferences
 prefs.compute_device_type='METAL';prefs.get_devices()
 metal_devices=[d for d in prefs.devices if d.type=='METAL']
 if metal_devices:
  for device in prefs.devices:device.use=device.type=='METAL'
  scene.cycles.device='GPU'
except Exception:
 pass
scene.render.use_overwrite='--fresh' in sys.argv
scene.render.resolution_x=720 if FINAL else 450
scene.render.resolution_y=900 if FINAL else 560
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.fps=24
scene.frame_start=1;scene.frame_end=72
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(1,1,1,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.8
scene.view_settings.view_transform='Standard'
scene.view_settings.look='Medium High Contrast' if 'Medium High Contrast' in [i.name for i in bpy.types.ColorManagedViewSettings.bl_rna.properties['look'].enum_items] else 'None'

def mat(name,color,metal=0,rough=.3):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
metal=mat('Anodized graphite titanium',(.16,.14,.20),.85,.23)
black=mat('Polished obsidian glass',(.008,.007,.012),.35,.17)
purple=mat('PathAble violet',(.35,.13,.72),.35,.25)
white=mat('Porcelain studio',(.96,.955,.975),0,.68)
root=bpy.data.objects.new('Phone animation controller',None);scene.collection.objects.link(root)
def box(name,loc,dim,material,bevel,parent=True):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 mod=o.modifiers.new('Precision rounded edges','BEVEL');mod.width=bevel;mod.segments=8;o.modifiers.new('Weighted studio normals','WEIGHTED_NORMAL')
 if parent:o.parent=root
 return o
box('Titanium enclosure',(0,0,0),(2.96,.29,6.12),metal,.23)
box('Black glass bezel',(0,-.155,0),(2.85,.065,6.00),black,.22)
# Rounded screen mesh with an explicit planar UV mapping for the real app screenshot.
w,h,r=2.69,5.82,.19
verts=[]
for cx,cz,a in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
 for j in range(13):
  t=math.radians(a+j*90/12);verts.append((cx+r*math.cos(t),-.195,cz+r*math.sin(t)))
mesh=bpy.data.meshes.new('Rounded display mesh');mesh.from_pydata(verts,[],[list(range(len(verts)))]);mesh.update();screen=bpy.data.objects.new('Actual PathAble navigation display',mesh);scene.collection.objects.link(screen);screen.parent=root
uv=mesh.uv_layers.new(name='Screen artwork UV')
for poly in mesh.polygons:
 for li in poly.loop_indices:
  x,_,z=verts[mesh.loops[li].vertex_index];uv.data[li].uv=(x/w+.5,z/h+.5)
sm=bpy.data.materials.new('PathAble project screenshot');sm.use_nodes=True;nodes=sm.node_tree.nodes;nodes.clear();out=nodes.new('ShaderNodeOutputMaterial');em=nodes.new('ShaderNodeEmission');em.inputs['Strength'].default_value=.88;tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(os.path.join(ROOT,'public/images/pathable-screen.png'));sm.node_tree.links.new(tex.outputs['Color'],em.inputs['Color']);sm.node_tree.links.new(em.outputs[0],out.inputs['Surface']);screen.data.materials.append(sm)
box('Camera island',(0,-.207,2.66),(.68,.018,.17),black,.08)
box('Volume control',(-1.50,.02,.9),(.048,.12,.48),metal,.025)
box('Power button',(1.50,.02,.65),(.048,.12,.68),metal,.025)
box('Home gesture',(0,-.207,-2.78),(.8,.02,.035),black,.017)
# Subtle accent rings sit behind the product and remain secondary to the screen.
for i in range(2):
 bpy.ops.mesh.primitive_torus_add(major_radius=2.15+i*.5,minor_radius=.013,major_segments=96,minor_segments=6,location=(0,.9,-1.8+i*.25),rotation=(math.radians(75),0,0));o=bpy.context.object;o.name='Violet journey orbit';o.data.materials.append(purple)
 for frame,shift in [(1,0),(36,.12),(73,0)]:
  o.rotation_euler.z=shift*(1 if i else -1);o.keyframe_insert('rotation_euler',frame=frame)
box('Studio floor',(0,0,-3.68),(200,200,.1),white,.01,False)
def area(name,loc,power,size,color):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large soft key',(-5,-7,9),1000,8,(1,.96,1));area('Cool edge',(5,2,6),1300,6,(.85,.8,1));area('Front fill',(1,-8,1),350,5,(1,1,1))
bpy.ops.object.camera_add(location=(6,-16,6.2));cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=9.1
for frame,angle,tilt,scale in [(1,-13,-9,9.1),(36,5,-5,8.7),(73,-13,-9,9.1)]:
 root.rotation_euler=(math.radians(5),math.radians(tilt),math.radians(angle));root.keyframe_insert('rotation_euler',frame=frame)
 cam.data.ortho_scale=scale;cam.data.keyframe_insert('ortho_scale',frame=frame)
cam.rotation_euler=(Vector((0,0,-.15))-cam.location).to_track_quat('-Z','Y').to_euler()
scene.frame_set(20)
os.makedirs(os.path.join(ROOT,'blender/scenes'),exist_ok=True)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/scenes/pathable-phone.blend'))
if FINAL:
 scene.render.filepath=os.path.join(ROOT,'blender/frames/phone-');os.makedirs(os.path.dirname(scene.render.filepath),exist_ok=True);bpy.ops.render.render(animation=True)
else:
 scene.render.filepath=os.path.join(ROOT,'public/animations/phone-preview.png');bpy.ops.render.render(write_still=True)
