<table>
	<tr>
		<td>素材文件</td>
		<td>
			<div id="file_container">
				<input type="file" name="file">
				<input type="button" name="file_overlay" value="打开素材文件" class="stretch"></div>
			</div>
		</td>
	</tr>
	<tr>
		<td>单元格宽度</td>
		<td><input type="number" name="tile_width" value="32"></td>
	</tr>
	<tr>
		<td>单元格高度</td>
		<td><input type="number" name="tile_height" value="32"></td>
	</tr>
	<tr>
		<td>单元格间隔</td>
		<td><input type="number" name="tile_margin" value="0"></td>
	</tr>
	<tr>
		<td><span class="hint" title="这里可指定一个十六进制格式或者RGB格式颜色，该颜色将被设置为透明">去除底色</span></td>
		<td><input type="text" name="tile_alpha" value="" maxlength="11" placeholder="HEX / RGB"></td>
	</tr>
</table>

<hr>

<input type="button" value="添加地图素材" id="tilesets_add" class="stretch">