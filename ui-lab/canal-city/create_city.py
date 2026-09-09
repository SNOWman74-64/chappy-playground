"""Run with Blender --background --factory-startup --python create_city.py."""
import bpy, math, random, os
from mathutils import Vector
random.seed(23)
OUT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
def material(name, color, metal=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*color,1); bs.inputs['Roughness'].default_value=.78; bs.inputs['Metallic'].default_value=metal
    return m
M={k:material(k,v) for k,v in {'stone':(.70,.73,.64),'paving':(.88,.85,.72),'road':(.35,.42,.38),'line':(.86,.83,.65),'cream':(.91,.79,.57),'rose':(.72,.38,.29),'mint':(.43,.65,.55),'white':(.93,.89,.74),'roof':(.53,.22,.13),'slate':(.19,.33,.30),'glass':(.10,.28,.29),'wood':(.38,.23,.12),'leaf':(.25,.46,.26),'leafLight':(.47,.61,.30),'yellow':(.93,.68,.22),'windowGlow':(.95,.73,.35)}.items()}
def cube(name, loc, scale, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name; o.dimensions=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(M[mat])
    if bevel:
        mod=o.modifiers.new('Soft model edges','BEVEL'); mod.width=bevel; mod.segments=1
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mod.name)
    return o
def cyl(name,loc,r,depth,mat,vertices=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc); o=bpy.context.object; o.name=name; o.data.materials.append(M[mat]); return o
def roof(x,y,w,d,h,mat='roof'):
    verts=[(x-w/2,y-d/2,h),(x+w/2,y-d/2,h),(x+w/2,y+d/2,h),(x-w/2,y+d/2,h),(x,y-d/2,h+1.1),(x,y+d/2,h+1.1)]
    mesh=bpy.data.meshes.new('gable'); mesh.from_pydata(verts,[],[(0,1,4),(3,5,2),(0,4,5,3),(1,2,5,4),(0,3,2,1)])
    ob=bpy.data.objects.new('Roof',mesh); bpy.context.collection.objects.link(ob); ob.data.materials.append(M[mat])
def house(x,y,w,d,h,color):
    z=.55
    cube('Townhouse',(x,y,z+h/2),(w,d,h),color,.04); roof(x,y,w+.15,d+.18,z+h)
    for s in [-1,1]:
        yy=y+s*(d/2+.015)
        for level in range(int(h/1.0)):
            for xx in [-w*.25,w*.25]:
                cube('Window',(x+xx,yy,z+.62+level*.95),(.38,.035,.5),'glass')
                cube('Sill',(x+xx,yy+s*.025,z+.35+level*.95),(.46,.08,.065),'white')
        cube('Cornice',(x,yy,z+h-.12),(w+.10,.12,.12),'white')
    cube('Chimney',(x+w*.26,y+.25,z+h+.6),(.30,.36,.9),'rose')
    cube('Door',(x,y-d/2-.025,.99),(.40,.06,.85),'wood')
def tree(x,y,size=1):
    cyl('Tree trunk',(x,y,.55+.7*size),.105*size,1.4*size,'wood',7)
    for dz,rr in [(1.7,.7),(2.15,.52)]:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=rr*size,location=(x,y,.55+dz*size)); bpy.context.object.data.materials.append(M[random.choice(['leaf','leafLight'])])

cube('Island foundation',(0,0,-.05),(28,22,.85),'stone',.2)
for y in [-6.7,6.7]:
    cube('Canal bank',(0,y,.38),(27.6,8.6,.35),'paving',.08)
    cube('Road',(0,3.65 if y>0 else -3.65,.58),(27.2,1.65,.04),'road')
    for x in range(-13,14,2): cube('Road dash',(x,3.65 if y>0 else -3.65,.61),(.65,.06,.02),'line')
    cube('Quay edge',(0,2.45 if y>0 else -2.45,.62),(27.5,.16,.2),'white')
for y in [-6.4,6.4]:
    for i,x in enumerate([-11,-8.55,-6.1,-3.65,-1.2,1.25,3.7,6.15,8.6,11]):
        if y<0 and x>3: continue
        if y>0 and -4<x<0: continue
        house(x,y,2.1,2.15,random.choice([2.7,3.5,4.2]),['cream','mint','rose','white'][i%4])
for x in [-11,-8,-5,4,7,10]:
    house(x,9.65,2.2,1.7,random.choice([2.8,3.5]),random.choice(['cream','mint','white']))
# Civic clock tower north bank.
cube('Tower plinth',(-2.4,6.5,.8),(2.5,2.5,.5),'white',.08)
cube('Clock tower',(-2.4,6.5,3.4),(1.7,1.7,5.2),'cream',.05)
for z in [2.2,4.2,5.8]: cube('Tower course',(-2.4,6.5,z),(1.87,1.87,.16),'white')
roof(-2.4,6.5,2.15,2.15,6.05,'slate')
cyl('Finial',(-2.4,6.5,7.35),.07,.65,'yellow')
for yy,rx in [(5.63,math.pi/2),(7.37,math.pi/2)]:
    o=cyl('Clock face',(-2.4,yy,5.13),.5,.04,'white',32); o.rotation_euler[0]=rx
    cube('Clock hand',(-2.4,yy-.03,5.3),(.045,.07,.35),'slate')
    cube('Clock hand',(-2.25,yy-.04,5.13),(.32,.07,.045),'slate')
# Footbridges and railings.
for x in [-7,5.5]:
    cube('Bridge deck',(x,0,.93),(1.65,5.6,.23),'paving',.06)
    for side in [-1,1]:
        cube('Bridge railing',(x+side*.72,0,1.53),(.075,5.4,.07),'slate')
        for y in [-2.5,-1.5,-.5,.5,1.5,2.5]: cube('Bridge post',(x+side*.72,y,1.25),(.07,.07,.65),'slate')
        cube('Bridge support',(x+side*.55,0,.55),(.15,4.8,.6),'stone')
# Market square, striped stalls.
for x in [4.4,6.4,8.4]:
    cube('Stall counter',(x,-6.5,1.0),(1.55,.75,.7),'wood')
    for dx in [-.7,.7]: cyl('Market pole',(x+dx,-6.5,1.7),.045,2.1,'wood',6)
    for i in range(6): cube('Canvas awning',(x-.75+i*.3,-6.5,2.5),(.3,1.25,.12),'white' if i%2 else 'yellow')
    for dx in [-.45,0,.45]: cyl('Market produce',(x+dx,-6.5,1.44),.17,.15,'rose',8)
# Pocket park at southeast.
cube('Park lawn',(8,-9.5,.57),(8,2.5,.12),'leafLight',.1)
for x,y in [(5,-9.4),(8,-9.8),(11,-9.5),(-12,-9.5),(-9,-9.5),(-6,-9.5),(-3,-9.5),(0,-9.5),(-12,1.95),(-9,1.95),(-3,1.95),(1,1.95),(9,1.95),(12,1.95),(-11,-1.95),(-3,-1.95),(1,-1.95),(10,-1.95)]: tree(x,y,random.uniform(.75,1.1))
for x in [-10,-2,3,10]:
    for y in [-2.9,2.9]:
        cyl('Streetlamp',(x,y,1.55),.045,2,'slate',6)
        cube('Lamp',(x,y,2.6),(.22,.22,.3),'windowGlow',.04)
for x in [-11,-3,3,11]:
    cube('Bench',(x,-1.9,.94),(1,.35,.12),'wood')
    for dx in [-.38,.38]: cube('Bench foot',(x+dx,-1.9,.72),(.08,.3,.4),'slate')
# Rails on north quay.
for y in [3.3,3.95]: cube('Tram rail',(0,y,.62),(27,.04,.035),'slate')
# Join static meshes per material: bounded WebGL draw calls.
for mat in M.values():
    objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==mat]
    if not objs: continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]; bpy.ops.object.join(); bpy.context.object.name='City_'+mat.name
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'assets','canal-city.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'assets','canal-city.glb'),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
print('CITY_EXPORT_COMPLETE')
