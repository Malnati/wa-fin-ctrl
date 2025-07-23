import React, { useState } from 'react';

const Row = ({ row, index, attrs, isEditable = false, temMotivo = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});

  const handleEdit = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveRowChanges = (dataHora) => {
    console.log('Salvando alterações para:', dataHora, editValues);
    setIsEditing(false);
    setEditValues({});
  };

  const cancelRowChanges = (dataHora) => {
    console.log('Cancelando alterações para:', dataHora);
    setIsEditing(false);
    setEditValues({});
  };

  const dismissRow = (dataHora) => {
    console.log('Marcando como desconsiderado:', dataHora);
  };

  const rotateImage = (dataHora) => {
    console.log('Rotacionando imagem:', dataHora);
  };

  const reprocessAI = (dataHora) => {
    console.log('Reprocessando com IA:', dataHora);
  };

  const renderClassificacao = () => {
    if (row.classificacao && row.classificacao !== 'nan' && row.classificacao !== '') {
      const classificacaoClass = row.classificacao.toLowerCase() === 'transferência' ? 'transferencia' : 
                                row.classificacao.toLowerCase() === 'pagamento' ? 'pagamento' : '';
      
      return (
        <span 
          className={`form-control-plaintext form-control-sm clickable-field classificacao ${classificacaoClass} ${isEditable ? 'edit-field' : ''}`}
          data-field="classificacao"
          data-original={row.classificacao}
          data-bs-toggle="tooltip" 
          data-bs-placement="top" 
          data-bs-title="Clique para editar a classificação"
        >
          {row.classificacao}
        </span>
      );
    } else if (isEditable) {
      return (
        <span 
          className="form-control-plaintext form-control-sm clickable-field classificacao edit-field empty-field"
          data-field="classificacao"
          data-original=""
          data-bs-toggle="tooltip" 
          data-bs-placement="top" 
          data-bs-title="Clique para editar a classificação"
        >
          
        </span>
      );
    }
    return null;
  };

  const renderValor = (field, valor, title) => {
    if (valor && valor !== 'nan' && valor !== '') {
      return (
        <span 
          className={`valor ${isEditable ? 'edit-field' : ''}`}
          data-field={field}
          data-original={valor}
          title={title}
        >
          {valor}
        </span>
      );
    } else if (isEditable) {
      return (
        <span 
          className={`valor edit-field empty-field`}
          data-field={field}
          data-original=""
          title={title}
        >
          
        </span>
      );
    }
    return null;
  };

  const renderAnexo = () => {
    if (row.row_class === 'total-row' || !row.anexo || row.anexo === 'nan' || row.anexo === '') {
      return null;
    }

    if (row.anexo.toLowerCase().endsWith('.jpg') || row.anexo.toLowerCase().endsWith('.jpeg') || row.anexo.toLowerCase().endsWith('.png')) {
      return (
        <img 
          src={`/imgs/${row.anexo}`}
          className="thumb"
          alt={`Comprovante ${row.anexo}`}
          title={row.anexo}
        />
      );
    } else if (row.anexo.toLowerCase().endsWith('.pdf')) {
      if (row.imagem_jpg) {
        return (
          <img 
            src={`/imgs/${row.imagem_jpg}`}
            className="thumb"
            alt={`Comprovante ${row.imagem_jpg}`}
            title={`${row.imagem_jpg} (convertido de PDF)`}
          />
        );
      } else {
        return <span className="pdf-icon" title="Visualizar PDF">📄</span>;
      }
    }
    return null;
  };

  const renderDescricao = () => {
    if (row.descricao && row.descricao !== 'nan' && row.descricao !== '') {
      return (
        <span 
          className={isEditable ? 'edit-field' : ''}
          data-field="descricao"
          data-original={row.descricao}
          title="Clique para editar a descrição"
        >
          {row.descricao}
        </span>
      );
    } else if (isEditable) {
      return (
        <span 
          className="edit-field empty-field"
          data-field="descricao"
          data-original=""
          title="Clique para editar a descrição"
        >
          
        </span>
      );
    }
    return null;
  };

  const renderOcr = () => {
    if (row.ocr && row.ocr !== 'nan') {
      const icon = row.anexo && row.anexo.toLowerCase().endsWith('.pdf') ? '📄' : 
                   row.anexo && (row.anexo.toLowerCase().endsWith('.jpg') || row.anexo.toLowerCase().endsWith('.jpeg') || row.anexo.toLowerCase().endsWith('.png')) ? '🖼️' : '';
      const ocrText = row.ocr.length > 100 ? `${row.ocr.substring(0, 100)}...` : row.ocr;
      
      return (
        <span>
          {icon} {ocrText}
        </span>
      );
    }
    return null;
  };

  return (
    <tr 
      className={row.row_class} 
      data-row-id={index} 
      data-motivo={row.motivo || ''} 
      data-data-hora={row.data_hora}
    >
      <td className="data-hora data-hora-cell desktop-only align-middle text-center">
        {row.data_hora}
      </td>
      <td className="classificacao-cell align-middle text-center">
        {renderClassificacao()}
      </td>
      <td className="valor-cell align-middle text-center">
        {renderValor('ricardo', row.ricardo, 'Clique para editar o valor de Ricardo')}
      </td>
      <td className="valor-cell align-middle text-center">
        {renderValor('rafael', row.rafael, 'Clique para editar o valor de Rafael')}
      </td>
      <td className="align-middle text-center">
        {renderAnexo()}
      </td>
      <td className="descricao-cell optional-column align-middle text-center" style={{textAlign: 'left', fontSize: '12px'}}>
        {renderDescricao()}
      </td>
      <td className="ocr-cell optional-column desktop-only align-middle text-center" style={{textAlign: 'left', fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        {renderOcr()}
      </td>
      {temMotivo && (
        <td className="align-middle text-center" style={{color: '#e67e22', fontSize: '12px'}}>
          {row.motivo && row.motivo !== 'nan' ? row.motivo : ''}
        </td>
      )}
      {isEditable && (
        <td className="actions-cell align-middle text-center">
          <div className="row-actions">
            <button 
              className="btn-save" 
              onClick={() => saveRowChanges(row.data_hora)}
              style={{display: isEditing ? 'inline-block' : 'none'}}
              title="Salvar alterações"
            >
              💾
            </button>
            <button 
              className="btn-cancel" 
              onClick={() => cancelRowChanges(row.data_hora)}
              style={{display: isEditing ? 'inline-block' : 'none'}}
              title="Cancelar alterações"
            >
              ❌
            </button>
            <button 
              className="btn-dismiss" 
              onClick={() => dismissRow(row.data_hora)}
              title="Marcar como desconsiderado"
            >
              🚫
            </button>
            <button 
              className="btn-rotate" 
              onClick={() => rotateImage(row.data_hora)}
              title="Rotacionar imagem"
              disabled={!row.anexo || row.anexo === 'nan' || row.anexo === ''}
            >
              🔄
            </button>
            <button 
              className="btn-reprocess" 
              onClick={() => reprocessAI(row.data_hora)}
              title="Reprocessar com IA"
              disabled={!row.anexo || row.anexo === 'nan' || row.anexo === ''}
            >
              🤖
            </button>
          </div>
        </td>
      )}
    </tr>
  );
};

export default Row; 