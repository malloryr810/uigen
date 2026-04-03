import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

test("shows 'Created' label for str_replace_editor create when done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Created App.jsx")).toBeDefined();
});

test("shows 'Creating…' label for str_replace_editor create when pending", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating App.jsx…")).toBeDefined();
});

test("shows 'Edited' label for str_replace_editor str_replace when done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Card.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Edited Card.jsx")).toBeDefined();
});

test("shows 'Edited' label for str_replace_editor insert when done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/components/Card.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Edited Card.jsx")).toBeDefined();
});

test("shows 'Read' label for str_replace_editor view when done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Read App.jsx")).toBeDefined();
});

test("shows 'Undid edit' label for str_replace_editor undo_edit when done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Undid edit to App.jsx")).toBeDefined();
});

test("shows 'Renamed' label for file_manager rename when done", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/foo.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Renamed foo.jsx")).toBeDefined();
});

test("shows 'Deleted' label for file_manager delete when done", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/foo.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Deleted foo.jsx")).toBeDefined();
});

test("shows fallback 'Done' for unknown tool when done", () => {
  render(
    <ToolInvocationBadge
      toolName="unknown_tool"
      args={{}}
      state="result"
    />
  );
  expect(screen.getByText("Done")).toBeDefined();
});

test("shows fallback 'Working…' for unknown tool when pending", () => {
  render(
    <ToolInvocationBadge
      toolName="unknown_tool"
      args={{}}
      state="call"
    />
  );
  expect(screen.getByText("Working…")).toBeDefined();
});

test("renders green dot when done", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("renders spinner when pending", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
