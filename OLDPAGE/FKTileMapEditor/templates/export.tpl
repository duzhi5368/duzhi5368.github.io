<table>
	<tr>
		<td>导出文件格式</td>
		<td>
			<select name="export_format">
				<option>JSON格式</option>
				<option>XML格式</option>
				<option>Project文件</option>
			</select>
		</td>
	</tr>
	<tr>
		<td>将导出数据格式化</td>
		<td>
			<select name="format_output" class="stretch">
				<option>是</option>
				<option>否</option>
			</select>
		</td>
	</tr>
	<tr>
		<td>导出时包含图片数据 (base64)</td>
		<td>
			<select name="include_base64" class="stretch">
				<option>不包含</option>
				<option>包含</option>
			</select>
		</td>
	</tr>
</table>

<hr>

<input type="button" value="导出" class="stretch" id="export">