import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { PageHeader, Badge } from "@/components/ui";
import { ROLES } from "@/lib/constants";
import { CreateStaffForm } from "./CreateStaffForm";
import { setActive, resetPassword } from "./actions";

export default async function StaffPage() {
  const owner = await requireOwner();

  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { fullName: "asc" }],
    include: {
      _count: { select: { salesAsSeller: true, paymentsReceived: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Сотрудники" subtitle={`Всего аккаунтов: ${users.length}`} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Логин</th>
                <th>Роль</th>
                <th>Продаж</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold">{u.fullName}</td>
                  <td>{u.login}</td>
                  <td>{ROLES[u.role as keyof typeof ROLES] ?? u.role}</td>
                  <td>{u._count.salesAsSeller}</td>
                  <td>
                    {u.active ? (
                      <Badge variant="green">активен</Badge>
                    ) : (
                      <Badge variant="red">заблокирован</Badge>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col gap-2">
                      {u.id !== owner.id && (
                        <form action={setActive}>
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={(!u.active).toString()}
                          />
                          <button className="btn btn-secondary btn-sm">
                            {u.active ? "Заблокировать" : "Разблокировать"}
                          </button>
                        </form>
                      )}
                      <details>
                        <summary className="btn btn-secondary btn-sm cursor-pointer">
                          Сбросить пароль
                        </summary>
                        <form
                          action={resetPassword}
                          className="flex gap-2 mt-2"
                        >
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            name="password"
                            className="input btn-sm !w-auto"
                            placeholder="Новый пароль"
                          />
                          <button className="btn btn-primary btn-sm">OK</button>
                        </form>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CreateStaffForm />
      </div>
    </div>
  );
}
